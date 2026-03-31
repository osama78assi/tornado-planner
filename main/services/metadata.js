import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Attribute from "../models/attribute.js";
import ApplicationError from "../util/applicationError.js";
import PlanAttribute from "../models/planAttributes.js";
import Plan from "../models/plan.js";

/**
 * @typedef AttributeAttrs
 * @property {string} key       - The key of the attribute
 * @property {string} type      - The type of the attribute
 */

/**
 * Callback function to run when there is only one plan uses this particular attribute
 * @callback onOneMatch
 * @param {string} key                      - The key that matched - it's a 'key' in the table attributes
 * @param {Attribute} attribute             - The real attribute data in the database
 * @param {string[]} keys              - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

/**
 * Callback function to run when there is more than one plan uses particular attribute
 * @callback onMoreThanOneMatch
 * @param {string} key                      - The key that matched - it's a 'key' in the table attributes
 * @param {Attribute} attribute             - The real attribute data in the database
 * @param {string[]} keys              - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

/**
 * Callback function to run when iterate over the passed keys
 * @callback onIteration
 * @param {string} key                      - The key that matched - it's a 'key' in the table attributes
 * @param {Attribute} attribute             - The real attribute data in the database
 * @param {string[]} keys              - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

class MetadataServices {
    /**
     *
     * @param {Object} props
     * @param {AttributeAttrs[]} props.attributes
     * @param {import("sequelize").Transaction} props.transaction
     */
    async upsert({ attributes, transaction }) {
        let t;

        // Create or accept a transaction
        if (!transaction) {
            t = await sequelize.transaction();
        } else {
            t = transaction;
        }

        // This consider the key is already trimmed
        try {
            if (!Array.isArray(attributes)) {
                throw new Error("The attributes must be an array");
            }

            // Create or update them
            await Attribute.bulkCreate(attributes, {
                ignoreDuplicates: true,
                transaction: t,
            });

            // Prepare the matcher & replacements
            const replacement = {};
            const pairs = attributes
                .map((attr, i) => {
                    replacement[`key_${i}`] = attr.key;
                    replacement[`type_${i}`] = attr.type;
                    return `(:key_${i}, :type_${i})`;
                })
                .join(",");

            // Return the Ids to link them to the plans
            const rows = await sequelize.query(
                `
                    WITH v(key, type) AS (
                        VALUES ${pairs}
                    )
                    SELECT attribute.id
                    FROM attributes attribute
                    JOIN v
                    ON v.key = attribute.key AND v.type = attribute.type;
                `,
                {
                    transaction: t,
                    replacements: {
                        ...replacement,
                    },
                    type: QueryTypes.SELECT,
                },
            );

            // If there is no passed transaction then commit
            if (!transaction) {
                await t.commit();
            }

            return rows;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            if (!transaction) {
                // Rollback in case the transaction isn't passed
                await t.rollback();
            }

            throw err;
        }
    }

    /**
     *
     * @param {Object} props
     * @param {Object} props.changes
     * @param {string[]} props.changes.delete
     * @param {Object} props.attrsMap     - Mapper between attribute keys and the id of it
     */
    async applyChanges({ changes, planId, transaction, attrsMap }) {
        let t = null;
        if (!transaction) {
            t = await sequelize.transaction();
        } else {
            t = transaction;
        }

        try {
            // Prepare the actions
            const actions = {
                // Contains ids of the attributes to delete
                deleteAttrs: [],

                // Contains the object that describe the update safely
                updatedAttrsType: [],
                updatedAttrsKey: [],

                // Contains many objects, this leads to attach too
                toCreate: [],

                // Contains the {key, type} to de-attach it from the plan
                toDeAttach: [],
            };

            // Get the plan attributes
            // [label]
            const plan = await Plan.findByPk(planId, {
                include: [{ model: Attribute, as: "attrs" }],
                transaction: t,
            });

            // 1. Check what to delete
            // - if the attribute is related to another model then de-attach
            // - if it's not then delete it and de-attach it
            this._checkDiff({
                keys: changes.delete,
                onOneMatch: (key, attribute) => {
                    actions.deleteAttrs.push(attribute.id);
                },
                onIteration: (key, attribute) => {
                    actions.toDeAttach.push({ key, type: attribute.type });
                },
                attrsMap,
                t,
            });

            // 2. Update:
            // - if the attribute is used in two plans then add new one and attach it
            // - if the attribute is used in one plan then update it
            // Starts with typeChangedCheck - this contains the key and the value is usless here
            this._checkDiff({
                keys: Object.keys(changes.typeChangedCheck),
                onOneMatch: (key, attribute) => {
                    actions.toCreate.push({ key, type: "check" });
                    actions.toDeAttach.push({ key, type: attribute.type });
                },
                onMoreThanOneMatch: (key, attribute) => {
                    const id = attribute.id;
                    actions.updatedAttrsType.push({
                        replacements: {
                            [`id_${id}`]: id,
                            [`type_${id}`]: "check",
                        },
                        statement: `WHEN id=:id_${id} THEN :type_${id}`,
                    });
                },
                attrsMap,
            });

            // Second go with typeChangedNormal, where it's an object that each key hold the new type so it's pretty much the same
            this._checkDiff({
                keys: Object.keys(changes.typeChangedNormal),
                onOneMatch: (key, attribute) => {
                    actions.toCreate.push({ key, type: "check" });
                    actions.toDeAttach.push({ key, type: attribute.type });
                },
                onMoreThanOneMatch: (key, attribute, keys) => {
                    actions.toCreate.push({
                        key,
                        type: changes.typeChangedNormal[key],
                    });
                    actions.toDeAttach.push({ key, type: attribute.type });
                },
                attrsMap,
            });

            // And here the same way, but as it's object of objects the key point to the new key (really key in Attribute table)
            this._checkDiff({
                keys: Object.keys(changes.nameChanged),
                onOneMatch: (key, attribute) => {
                    const id = attribute.id;
                    // Update that attributes
                    actions.updatedAttrsKey.push({
                        replacements: {
                            [`id_${id}`]: id,
                            [`check_${id}`]: changes.nameChanged[key],
                        },
                        statement: `WHEN id=:id_${id} THEN :check_${id}`,
                    });
                },
                onMoreThanOneMatch: (key, attribute, keys) => {
                    actions.toCreate.push({
                        key: changes.nameChanged[key],
                        type: attribute.type,
                    });
                    actions.toDeAttach.push({ key, type: attribute.type });
                },
                attrsMap,
            });

            // Build the final queries
            // 1. Delete the attributes . simple
            await Attribute.destroy({
                where: { id: { [Op.in]: actions.deleteAttrs } },
                transaction: t,
            });

            // 2. Build the dynamic update query
            if (
                actions.updatedAttrsKey.length ||
                actions.updatedAttrsType.length
            ) {
                // prepare the global replacements
                const replacments = {};

                // Update type
                const typeUpd = this._prepareReplacements(
                    "type",
                    replacments,
                    actions.updatedAttrsType,
                );

                // Update key
                // Here we need to add comma in case the update cover the two cases
                const keyUpd = this._prepareReplacements(
                    "key",
                    replacments,
                    actions.updatedAttrsKey,
                    typeUpd === "",
                );

                await sequelize.query(
                    `
                    UPDATE ${Attribute.tableName}
                    SET
                    ${typeUpd}
                    ${keyUpd}
                `,
                    {
                        type: QueryTypes.UPDATE,
                        transaction: t,
                    },
                );
            }

            // 3. Create the missing attributes
            if (actions.toCreate.length) {
                const ids = await this.upsert({
                    attributes: actions.toCreate,
                    transaction: t,
                });
                // Attach them
                await PlanAttribute.bulkCreate(
                    ids.map((attributeId) => ({ attributeId, planId })),
                    { transaction: t },
                );
            }
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            throw err;
        }
    }

    /**
     * Helper function to check how many plans related to the specific attribute
     * @param {string} id
     * @param {import("sequelize").Transaction} transaction
     * @returns
     */
    async _checkUsage(id) {
        return await PlanAttribute.findAll({
            where: {
                "$attribute.id$": id,
            },
            include: [
                {
                    model: Attribute,
                    as: "attribute",
                    required: true,
                },
            ],
            // Only bring 2
            limit: 2,
            transaction,
        });
    }

    /**
     * helper function to loop over the keys and do some actions
     * @param {Object} props
     * @param {string[]} props.keys                                     - The keys you want to loop over them, those keys must be used as key in the attribute table
     * @param {onMoreThanOneMatch} props.onMoreThanOneMatch
     * @param {onOneMatch} props.onOneMatch
     * @param {onIteration} props.onIteration
     * @param {Object} props.attrsMap                                   - Mapper between attribute keys and the id of it
     * @param {import("sequelize").Transaction} props.transaction       - The transaction, will make the operation faster
     */
    async _checkDiff({
        keys,
        onOneMatch,
        onIteration,
        onMoreThanOneMatch,
        attrsMap,
        transaction,
    }) {
        for (let key of keys) {
            // Take the id of that specific attribute, again that is possible because the key itself is unique across the plan
            const data = await this._checkUsage(attrsMap[key], transaction);
            if (data.length > 1) {
                onMoreThanOneMatch?.(key, data[0].attribute, keys);
            } else {
                onOneMatch?.(key, data[0].attribute, keys);
            }
            onIteration?.(key, data[0].attribute, keys);
        }
    }

    /**
     * Helper function that accept the replacements object, the array that contains update details and return SQL statement. or empty string, you can add comma in the beginning
     * @param {Object} replacments
     * @param {Object[]} metadataArr
     * @param {boolean} addComma
     * @returns
     */
    _prepareReplacements(column, replacments, metadataArr, addComma = false) {
        // In case it was empty return empty srting
        if (!metadataArr.length) return "";

        let statement = metadataArr.map((obj, i) => {
            // Copy them one by one, faster from spread
            for (let key in obj.replacement) {
                replacments[key] = obj.replacement[key];
            }

            // Simliar to joins but used the same loop to do more that one thing
            if (i === 0) return obj.statement;
            return `\n${obj.statement}`;
        });

        // Here we need to add comma in case the update cover the two cases
        return `${addComma ? "" : ", "}${column} = CASE ${statement} ELSE ${column}`;
    }
}

export default new MetadataServices();
