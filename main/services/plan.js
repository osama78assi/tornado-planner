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
import Value from "../models/value.js";

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
            const attributeIds = await metadataServices.upsertAttributes({
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

    async update(id, payload, newKeyOldKeyMap = {}) {
        // Mental model:
        // sanitize metadata -> add/update default metadata
        // -> prepare differnciation object -> update / delete / add the attributes
        // -> update tasks relation / delete tasks values
        // Start transaction
        const transaction = await sequelize.transaction();
        try {
            // Mapping object contains the old key -> new key

            // Changes object to keep track of all changes to do
            let changes = null;

            // Changes object to keep track of all changes to do
            let attrsMap;

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
                attrsMap = {};
                plan.attrs.forEach((attr) => {
                    attrsMap[attr.key] = attr.id;
                });

                // Categorize the changes to update tasks
                changes = {
                    // Contains {key: type} that required to create/retriev an attribute
                    new: {},

                    // Contains only the key
                    delete: [],

                    // Contains the key: values
                    typeChangedCheck: {},

                    // Contains the key: new type
                    typeChangedNormal: {},

                    // Contains the key: new key
                    nameChanged: {},
                };

                Object.keys(payload.metadata).forEach((schemaKey) => {
                    // Schema key has changed
                    if (newKeyOldKeyMap[schemaKey]) {
                        // Make sure that this will have new key -> old key
                        changes.nameChanged[newKeyOldKeyMap[schemaKey]] =
                            schemaKey;
                    }

                    // More readability
                    const newSchema = payload.metadata[schemaKey];
                    let oldSchema = plan.dataValues.metadata[schemaKey];

                    // Make sure if there is a change in the name
                    if (newKeyOldKeyMap[schemaKey])
                        oldSchema =
                            plan.dataValues.metadata[
                                newKeyOldKeyMap[schemaKey]
                            ];

                    // Case1: new field -> skip
                    if (!oldSchema) {
                        changes.new[schemaKey] = newSchema.type;
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
                    if (
                        !payload.metadata[oldKey] &&
                        !changes.nameChanged[oldKey]
                    ) {
                        changes.delete.push(oldKey);
                    }
                }
            }

            // Update the attributes
            // This will return an object of attribute ids to swap them
            // swap: {
            //  [fromAttributeId]: [toAttributeId]
            // }
            //
            changes.swap = await metadataServices.applyAttributeChanges({
                changes,
                planId: id,
                transaction: transaction,
                attrsMap,
            });

            await Plan.update(payload, {
                where: { id },
                transaction: transaction,
            });

            // Call task function to update specified tasks metadata if it's changed
            if (changes !== null) {
                // What really will change is the values of those which the type changed
                // because key changed already applied and delete attributes already applied
                await metadataServices.applyValueChanges(
                    id,
                    changes,
                    transaction,
                );
            }

            await transaction.commit();

            // In sqlite you need to query
            return await Plan.findByPk(id);
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            await transaction.rollback();
            throw err;
        }
    }

    async destory(id) {
        const transaction = await sequelize.transaction();
        try {
            // Get the plan linked attributes in case no more plans them to delete them
            const attributes = await Attribute.findAll({
                attributes: ["id"],
                where: {
                    "$plans.id$": id,
                },
                include: [
                    {
                        model: Plan,
                        as: "plans",
                        attributes: [], // avoids fetching full plan data
                    },
                ],
                subQuery: false, // ensures proper filtering in M:N
                transaction: transaction,
            });

            const count = await Plan.destroy({
                where: {
                    id,
                },
                transaction: transaction,
            });

            // Delete the attributes where it's not no longer used
            await metadataServices.deleteNotUsedAttributes(
                attributes,
                transaction,
            );

            if (count === 0) {
                throw PLAN_NOT_EXIST;
            }

            await transaction.commit();

            return true;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            await transaction.rollback();

            throw err;
        }
    }

    async get(page = 1, limit = 10, filters = null, loadAll = false) {
        try {
            // Build the where statement
            let where = null;
            if (filters) {
                where = mapFilters(filters);
            }

            // Get the count
            const count = await Plan.count({ ...(where ? { where } : {}) });

            // Get the safe limit (undefined if loadAll, which Sequelize will ignore)
            const safeLimit = loadAll ? undefined : getSafeLimit(limit);

            // Calculate the offset
            const offset = safeLimit ? (page - 1) * safeLimit : 0;

            // Get plans
            const data = await Plan.findAll({
                limit: safeLimit,
                offset,
                ...(where ? { where } : {}),
            });

            // Calculate the remaining pages (1 if loadAll, otherwise calculated)
            const pages = Math.ceil(count / (loadAll ? count : safeLimit));

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
