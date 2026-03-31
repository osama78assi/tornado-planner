import {
    DEFAULT_SCHEMA,
    isValidSchema,
    isValidSchemaKey,
    REQUIRED_SCHEMAS,
    sanitizeMetadata,
} from "../config/constant.js";
import sequelize from "../config/sequelize.js";
import { PLAN_NOT_EXIST } from "../errors/plan.js";
import Plan from "../models/plan.js";
import ApplicationError from "../util/applicationError.js";
import { getSafeLimit, mapFilters } from "../util/global.js";
import taskServices from "./task.js";
import metadataServices from "./metadata.js";
import PlanAttribute from "../models/planAttributes.js";
import Attribute from "../models/attribute.js";

class PlanServices {
    async create(details) {
        // Mental model: sanitize ----> add/replace default metadata ----> validate metadata ----> Create/update attributes and link them
        const transaction = await sequelize.transaction();
        try {
            // Check if the metadata is provided or not
            if (!details.metadata) {
                details.metadata = {};
            } else {
                // Remove the leading and trailing whitespaces
                sanitizeMetadata(details.metadata);
            }

            // If the user sent any key from the required schema then delete it and take the one from the backend
            REQUIRED_SCHEMAS.forEach((key) => {
                // Copy that schema even if it's not exist
                details.metadata[key] = DEFAULT_SCHEMA(
                    key,
                    details.metadata[key],
                );
            });

            const attrs = [];
            // Loop over the metadata and validate each schema on it
            Object.keys(details.metadata).map((key) => {
                try {
                    isValidSchema(details.metadata[key], key);

                    // If valid add that to the attributes array
                    attrs.push({ key, type: details.metadata[key].type });
                } catch (err) {
                    throw err;
                }
            });

            // Update/create the attributes
            const attributeIds = await metadataServices.upsert({
                attributes: attrs,
                transaction,
            });

            // Everything is correct then go for it
            const plan = await Plan.create(details, { transaction });

            // Link them
            await PlanAttribute.bulkCreate(
                attributeIds.map((attr) => ({
                    attributeId: attr.id,
                    planId: plan.id,
                })),
                { transaction },
            );

            await transaction.commit();

            return plan;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            await transaction.rollback();

            throw err;
        }
    }

    async update(id, payload, mapping = {}) {
        // Mental model:
        // sanitize metadata -> add/update default metadata
        // -> prepare differnciation object -> update / delete / add the attributes
        // -> update tasks relation / delete tasks values
        // Start transaction
        const t = await sequelize.transaction();
        try {
            // Mapping object contains the old key -> new key

            // Changes object to keep track of all changes to do
            let changes = null;

            // If the metadata is provided then
            if (payload.metadata) {
                // Remove the leading and trailing whitespaces
                sanitizeMetadata(payload.metadata);

                // If the user sent any key from the required schema then delete it and take the one from the backend
                REQUIRED_SCHEMAS.forEach((key) => {
                    // Copy that schema even if it's not exist
                    payload.metadata[key] = DEFAULT_SCHEMA(
                        key,
                        payload.metadata[key],
                    );
                });

                // Loop over the metadata and validate each schema on it
                Object.keys(payload.metadata).map((key) => {
                    try {
                        isValidSchema(payload.metadata[key], key);
                    } catch (err) {
                        throw err;
                    }
                });

                // Get the old metadata and specify each field by a case
                const plan = await Plan.findByPk(id, {
                    attributes: ["metadata"],
                    include: [
                        {
                            model: Attribute,
                            // [label]
                            as: "attrs",
                            through: {
                                attributes: [], // removes junction table data
                            },
                        },
                    ],
                });

                // Build the map between attribute keys and ids, this will be unique across the individual plan
                const attrsMap = {};
                plan.attrs.forEach((attr) => {
                    attrsMap[attr.key] = attr.id;
                });

                // Categorize the changes to update tasks
                changes = {
                    // Contains only the key
                    delete: [],

                    // Contains the key: values
                    typeChangedCheck: {},

                    // Contains the key: new type
                    typeChangedNormal: {},

                    // this is no longer need wtf ?
                    // Contains the key: new key
                    nameChanged: {},
                };

                Object.keys(payload.metadata).forEach((schemaKey) => {
                    // Schema key has changed
                    if (mapping[schemaKey]) {
                        changes.nameChanged[schemaKey] = mapping[schemaKey];
                    }

                    // More readability
                    const newSchema = payload.metadata[schemaKey];
                    const oldSchema = plan.dataValues.metadata[schemaKey];

                    // Case1: new field -> skip
                    if (!oldSchema) {
                        return;
                    }

                    // Case2: Check if the type has changed and it's not check
                    if (
                        newSchema.type !== oldSchema.type &&
                        newSchema.type !== "check"
                    ) {
                        changes.typeChangedNormal[schemaKey] = newSchema.type;
                    }

                    // Case2: Check if the type has changed and it's check
                    if (
                        newSchema.type !== oldSchema.type &&
                        newSchema.type === "check"
                    ) {
                        changes.typeChangedCheck[schemaKey] = newSchema.values;
                    }

                    // Case2: Check if it was check and it's now check with different values
                    if (
                        newSchema.type === "check" &&
                        oldSchema.type === "check"
                    ) {
                        if (
                            newSchema.values.length !== oldSchema.values.length
                        ) {
                            changes.typeChangedCheck[schemaKey] =
                                newSchema.values;
                        } else {
                            // Brute force
                            // Convert the first one to set
                            const newSchemaSet = new Set(newSchema.values);

                            // Loop over the other one and compare
                            for (let i = 0; i < oldSchema.values.length; i++) {
                                if (!newSchemaSet.has(oldSchema.values[i])) {
                                    changes.typeChangedCheck[schemaKey] =
                                        newSchema.values;
                                    return;
                                }
                            }
                        }
                    }
                });

                if (
                    payload.isArchived === true ||
                    payload.isArchived === false
                ) {
                    // Save the date when the user archive the value
                    payload.archivedAt = new Date();
                }

                // Detect the deleted metadata
                for (const oldKey in plan.dataValues.metadata) {
                    // But check if it's not old key got updated
                    if (!payload.metadata[oldKey] && !mapping[oldKey]) {
                        changes.delete.push(oldKey);
                    }
                }
            }

            // Update the attributes
            await metadataServices.applyChanges({
                changes,
                planId: plan.id,
                transaction: t,
                attrsMap,
            });

            await Plan.update(payload, {
                where: { id },
                transaction: t,
            });

            // Call task function to update specified tasks metadata if it's changed
            if (changes !== null) {
                await taskServices._updateMetadata(id, changes, t);
            }

            await t.commit();

            // In sqlite you need to query
            return await Plan.findByPk(id);
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            await t.rollback();
            throw err;
        }
    }

    async destory(id) {
        try {
            const count = await Plan.destroy(id);
            if (count === 0) {
                throw PLAN_NOT_EXIST;
            }

            return true;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            throw err;
        }
    }

    async get(page = 1, limit = 10, filters = null) {
        try {
            // Build the where statement
            let where = null;
            if (filters) {
                where = mapFilters(filters);
            }

            // Get the safe limit
            const safeLimit = getSafeLimit(limit);

            // Get the count
            const count = await Plan.count({ ...(where ? { where } : {}) });

            // Calculate the offset
            const offset = (page - 1) * limit;

            // Get plans
            const data = await Plan.findAll({
                limit: safeLimit,
                offset,
                ...(where ? { where } : {}),
            });

            // Calculate the remaining pages
            const pages = Math.ceil(count / limit);

            return {
                data,
                pagination: { pages, count },
            };
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }
}

export default new PlanServices();
