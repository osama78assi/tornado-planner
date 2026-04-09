import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Attribute from "../models/attribute.js";
import ApplicationError from "../util/applicationError.js";
import PlanAttribute from "../models/planAttributes.js";
import Plan from "../models/plan.js";
import Value from "../models/value.js";
import { v4 as generateId } from "uuid";
import { isValidValue } from "../config/constant.js";

/**
 * @typedef AttributeAttrs
 * @property {string} key       - The key of the attribute
 * @property {string} type      - The type of the attribute
 */

/**
 * Callback function to run when there is no plan uses this particular attribute
 * @callback onNoMatch
 * @param {string} key                      - The key that matched
 * @param {string[]} keys                   - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

/**
 * Callback function to run when there is plan(s) uses this particular attribute
 * @callback onMatch
 * @param {string} key                      - The key that matched - it's a 'key' in the table attributes
 * @param {Attribute} attribute             - The real attribute data in the database
 * @param {string[]} keys                   - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

/**
 * Callback function to run when there is only one plan uses this particular attribute
 * @callback onOneMatch
 * @param {string} key                      - The key that matched - it's a 'key' in the table attributes
 * @param {Attribute} attribute             - The real attribute data in the database
 * @param {string[]} keys                   - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

/**
 * Callback function to run when there is more than one plan uses particular attribute
 * @callback onMoreThanOneMatch
 * @param {string} key                      - The key that matched - it's a 'key' in the table attributes
 * @param {Attribute} attribute             - The real attribute data in the database
 * @param {string[]} keys                   - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

/**
 * Callback function to run when iterate over the passed keys
 * @callback onIteration
 * @param {string} key                      - The key that matched - it's a 'key' in the table attributes
 * @param {Attribute} attribute             - The real attribute data in the database
 * @param {string[]} keys                   - The keys you want to loop over them, those keys must be used as key in the attribute table
 */

class MetadataServices {
    /**
     *
     * @param {Object} props
     * @param {AttributeAttrs[]} props.attributes
     * @param {import("sequelize").Transaction} props.transaction
     */
    async upsertAttributes({ attributes, transaction }) {
        let localTransaction;

        // Create or accept a transaction
        if (!transaction) {
            localTransaction = await sequelize.transaction();
        } else {
            localTransaction = transaction;
        }

        // This consider the key is already trimmed
        try {
            if (!Array.isArray(attributes)) {
                throw new Error("The attributes must be an array");
            }

            // Create or ingore them
            await Attribute.bulkCreate(attributes, {
                ignoreDuplicates: true,
                transaction: localTransaction,
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

            // Return the details to link them to the plans
            const rows = await sequelize.query(
                `
                    WITH v(key, type) AS (
                        VALUES ${pairs}
                    )
                    SELECT
                        attribute.id,
                        attribute.key,
                        attribute.type
                    FROM attributes attribute
                    JOIN v
                    ON v.key = attribute.key AND v.type = attribute.type;
                `,
                {
                    transaction: localTransaction,
                    replacements: {
                        ...replacement,
                    },
                    type: QueryTypes.SELECT,
                },
            );

            // If there is no passed transaction then commit
            if (!transaction) {
                await localTransaction.commit();
            }

            return rows;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            if (!transaction) {
                // Rollback in case the transaction isn't passed
                await localTransaction.rollback();
            }

            throw err;
        }
    }
    /**
     *
     * @param {Object[]} values
     * @param {import("sequelize").Transaction} transaction
     */
    async upsertValues(values, transaction) {
        let localTransaction = transaction || (await sequelize.transaction());

        try {
            values = values.filter(
                (v) => v.value !== null && v.value !== undefined,
            );
            if (!values.length) return;

            const now = new Date();

            // Build (:value_0, :attributeId_0, :taskId_0, :updatedAt_0), ...
            const rows = [];
            const replacements = {};

            values.forEach((v, i) => {
                rows.push(
                    `(:value_${i}, :attributeId_${i}, :planId_${i}, :taskId_${i}, :updatedAt_${i})`,
                );
                replacements[`value_${i}`] = v.value;
                replacements[`attributeId_${i}`] = v.attributeId;
                replacements[`taskId_${i}`] = v.taskId;
                replacements[`updatedAt_${i}`] = now;
                replacements[`planId_${i}`] = v.planId;
            });

            const sql = `
                INSERT INTO "${Value.tableName}" (value, "attributeId", "planId", "taskId", "updatedAt")
                VALUES ${rows.join(",")}
                ON CONFLICT("attributeId", "taskId")
                DO UPDATE SET
                    value = excluded.value,
                    "updatedAt" = excluded."updatedAt"
            `;

            await sequelize.query(sql, {
                replacements,
                transaction: localTransaction,
            });

            if (!transaction) await localTransaction.commit();
        } catch (err) {
            if (!transaction) await localTransaction.rollback();
            throw err;
        }
    }

    /**
     * Receive object describe the changes and run them accordingly in the attributes
     * @param {Object} props
     * @param {Object} props.changes
     * @param {string[]} props.changes.delete
     * @param {Object} props.attrsMap     - Mapper between attribute keys and the id of it
     */
    async applyAttributeChanges({ changes, planId, transaction, attrsMap }) {
        let localTransaction = null;
        if (!transaction) {
            localTransaction = await sequelize.transaction();
        } else {
            localTransaction = transaction;
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

                // Contains the id to de-attach it from the plan
                toDeAttach: [],

                // Sometimes only the attach is required it's {planId, attributeId}
                toAttach: [],
            };

            // Create the swap objecet to return it
            const swap = {};

            // Get the plan attributes
            // [label]
            const plan = await Plan.findByPk(planId, {
                include: [{ model: Attribute, as: "attrs" }],
                transaction: localTransaction,
            });

            // 1. Check what to delete
            // - if the attribute is related to another model then de-attach
            // - if it's not then delete it and de-attach it
            await this._checkDiff({
                keys: changes.delete,
                onOneMatch: (key, attribute) => {
                    actions.deleteAttrs.push(attribute.id);
                },
                onIteration: (key, attribute) => {
                    actions.toDeAttach.push(attrsMap[key]);
                },
                attrsMap,
                transaction: localTransaction,
            });

            // 2. Update:
            // - if the attribute is used in two plans then add new one and attach it
            // - if the attribute is used in one plan then update it
            // Starts with typeChangedCheck - this contains the key and the value is usless here
            await this._checkDiff({
                keys: Object.keys(changes.typeChangedCheck),
                onOneMatch: (key, attribute) => {
                    const id = attribute.id;
                    actions.updatedAttrsType.push({
                        replacements: {
                            [`id_${id}`]: id,
                            [`type_${id}`]: "check",
                        },
                        statement: `WHEN id=:id_${id} THEN :type_${id}`,
                    });
                },
                onMoreThanOneMatch: (key, attribute) => {
                    actions.toCreate.push({ key, type: "check" });
                    actions.toDeAttach.push(attrsMap[key]); // Do map and get the id by the key
                    // This is just swap because two plans are using this attribte
                    // Here you add the attribute key you need to change
                    swap[attrsMap[key]] = {
                        key,
                        type: "check",
                    };
                },
                attrsMap,
                transaction: localTransaction,
            });

            // Second go with typeChangedNormal, where it's an object that each key hold the new type so it's pretty much the same
            await this._checkDiff({
                keys: Object.keys(changes.typeChangedNormal),
                onOneMatch: (key, attribute) => {
                    const id = attribute.id;
                    actions.updatedAttrsType.push({
                        replacements: {
                            [`id_${id}`]: id,
                            [`type_${id}`]: changes.typeChangedNormal[key],
                        },
                        statement: `WHEN id=:id_${id} THEN :type_${id}`,
                    });
                },
                onMoreThanOneMatch: (key, attribute) => {
                    actions.toCreate.push({
                        key,
                        type: changes.typeChangedNormal[key],
                    });
                    actions.toDeAttach.push(attrsMap[key]); // Do map and get the id by the key

                    // This is just swap because two plans are using this attribte
                    swap[attrsMap[key]] = {
                        key,
                        type: changes.typeChangedNormal[key],
                    };
                },
                attrsMap,
                transaction: localTransaction,
            });

            // Here a little bit different
            // 1. If there is only one match then update
            // 2. If there is more that one match we need to create a new one and return it to link the old values to it
            await this._checkDiff({
                keys: Object.keys(changes.nameChanged),
                onOneMatch: (key, attribute) => {
                    const id = attribute.id;
                    actions.updatedAttrsKey.push({
                        replacements: {
                            [`id_${id}`]: id,
                            [`key_${id}`]: changes.nameChanged[key],
                        },
                        statement: `WHEN id=:id_${id} THEN :key_${id}`,
                    });
                },
                onMoreThanOneMatch: (key, attribute) => {
                    actions.toCreate.push({
                        key: changes.nameChanged[key],
                        type: attribute.type,
                    });
                    actions.toDeAttach.push(attrsMap[key]); // Do map and get the id by the key

                    // This is just swap because two plans are using this attribte
                    swap[attrsMap[key]] = {
                        key: changes.nameChanged[key],
                        type: attribute.type,
                    };
                },
                attrsMap,
                transaction: localTransaction,
            });

            // Check what to create/retrieve
            await this._checkDiff({
                keyTypeMap: changes.new,
                keys: Object.keys(changes.new),
                onNoMatch: (key, keys) => {
                    actions.toCreate.push({
                        key,
                        type: changes.new[key],
                    });
                },

                // Wether it was one match or two it will be more because this will be attached too
                onMatch: (key, attribute) => {
                    // Just add the PlanAttribute data type
                    actions.toAttach.push({
                        planId: planId,
                        attributeId: attribute.id,
                    });
                },

                transaction: localTransaction,
                attrsMap,
                searchByObject: true, // To search by the key & type
            });

            // Build the final queries
            // 1. Delete the attributes . simple
            if (actions.deleteAttrs.length) {
                await Attribute.destroy({
                    where: { id: { [Op.in]: actions.deleteAttrs } },
                    transaction: localTransaction,
                });
            }

            // 2. Build the dynamic update query
            if (
                actions.updatedAttrsKey.length ||
                actions.updatedAttrsType.length
            ) {
                // prepare the global replacements
                const replacements = {};

                // Update type
                const { cases: typeUpd, ids: typeIds } =
                    this._prepareReplacements(
                        "type",
                        replacements,
                        actions.updatedAttrsType,
                    );

                // Update key
                // Here we need to add comma in case the update cover the two cases
                const { cases: keyUpd, ids: keyIds } =
                    this._prepareReplacements(
                        "key",
                        replacements,
                        actions.updatedAttrsKey,
                        typeUpd === "",
                    );

                await sequelize.query(
                    `
                    WITH ids(targetId) AS (
                        VALUES
                        ${typeIds ? typeIds.join(",") : ""}
                        ${keyIds ? keyIds.join(",") : ""}
                    )
                    UPDATE ${Attribute.tableName}
                    SET
                    ${typeUpd ? typeUpd : ""}
                    ${keyUpd ? keyUpd : ""}
                    END

                    FROM ids
                    WHERE id = ids.targetId
                `,
                    {
                        type: QueryTypes.UPDATE,
                        transaction: localTransaction,
                        replacements,
                    },
                );
            }

            // Save the final swap object to return it
            let finalSwap = {};

            // 3. Create the missing attributes
            if (actions.toCreate.length) {
                const attributes = await this.upsertAttributes({
                    attributes: actions.toCreate,
                    transaction: localTransaction,
                });

                // Attach them
                await PlanAttribute.bulkCreate(
                    attributes.map((attr) => ({
                        attributeId: attr.id,
                        planId,
                    })),
                    {
                        transaction: localTransaction,
                        ignoreDuplicates: true, // In case there is something duplicated then just ignore it
                    },
                );

                // Build a map for easy lookup from key-type to id
                const lookupKeys = {};
                attributes.forEach((attribute) => {
                    lookupKeys[`${attribute.key}-${attribute.type}`] =
                        attribute.id;
                });

                // Build the final swap
                for (const fromAttrId in swap) {
                    finalSwap[fromAttrId] =
                        lookupKeys[
                            `${swap[fromAttrId].key}-${swap[fromAttrId].type}`
                        ];
                }
            }

            // 4. De-attach now
            if (actions.toDeAttach.length) {
                await PlanAttribute.destroy({
                    where: {
                        [Op.or]: [
                            ...actions.toDeAttach.map((attributeId) => ({
                                attributeId,
                                planId,
                            })),
                        ],
                    },
                    transaction: localTransaction,
                });
            }

            // 5. Attach now
            if (actions.toAttach.length) {
                await PlanAttribute.bulkCreate(actions.toAttach, {
                    transaction: localTransaction,
                });
            }

            if (!transaction) {
                await localTransaction.commit();
            }

            return finalSwap;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            if (!transaction) {
                await localTransaction.rollback();
            }
            throw err;
        }
    }

    /**
     * Helper function that recieve the planId and an object describe the changes and it will apply them to the values
     * @param {*} planId
     * @param {*} changes
     * @param {*} transaction
     */
    async applyValueChanges(planId, changes, transaction) {
        // If there is no transaction then create your own
        let localTransaction = null;
        if (transaction) {
            localTransaction = transaction;
        } else {
            localTransaction = await sequelize.transaction();
        }

        try {
            // Swap if there is something provided
            if (Object.keys(changes.swap).length) {
                // Build the cases array
                const casess = [];

                // Build the ids array
                const ids = Object.keys(changes.swap).map((fromAttrId) => {
                    casess.push(
                        `WHEN "attributeId"=${fromAttrId} THEN ${changes.swap[fromAttrId]}`,
                    );
                    return `(${fromAttrId})`;
                });

                // Run the update
                await sequelize.query(
                    `
                        WITH attributeIds (targetAttributeId) AS (
                            VALUES ${ids.join(",")}
                        )

                        UPDATE
                        "${Value.tableName}" SET "attributeId" =
                        CASE
                            ${casess.join("\n")}
                            ELSE "attributeId"
                        END
                        FROM attributeIds
                        WHERE
                            "planId" = :planId AND 
                            attributeIds.targetAttributeId = "attributeId"
                    `,
                    {
                        type: QueryTypes.UPDATE,
                        raw: true,
                        replacements: {
                            planId,
                        },
                        transaction: localTransaction,
                    },
                );
            }

            // Load all tasks in the memory for specified plan
            // As an optimization later you can reject this process and
            // set to null all new/updated fields if the tasks are too much.
            // But note that this step is rare to happen in the middle of the plan
            // This is the values
            const taskValues = await PlanAttribute.findAll({
                where: { planId },
                attributes: ["id", "planId"],
                include: [
                    {
                        model: Attribute,
                        as: "attribute",
                        attributes: ["id", "type", "key"],
                        include: [
                            {
                                model: Value,
                                as: "values",
                                attributes: ["id", "value"],
                            },
                        ],
                    },
                    {
                        model: Plan,
                        as: "plan",
                        attributes: ["id", "metadata"],
                    },
                ],
                transaction: localTransaction,
            });
            /*
            Test case to imagine the algorithm
            [
                {
                    id: 1,
                    attribute: {
                        id: 1,
                        key: "priority"
                        type: "check", // example
                        values: [
                            {
                                id: 1,
                                value: "low",
                            },
                            {
                                id: 2,
                                value: "high",
                            }
                        ],
                    },
                    plan: {
                        id: 1,
                        metadata: {
                            priority: {
                                type: "check",
                                values: ["low", "high"] // example
                            }
                        }
                    }
                }
            ]
            */

            // Build foreach value record a new update statment
            const ids = [];
            const updateValueCases = [];
            const valueReplacements = {};

            // Loop over columns and if the column changed then update all values for that column
            for (const taskColumn of taskValues) {
                const typeChangedNormal =
                    changes?.typeChangedNormal?.[
                        taskColumn?.dataValues?.attribute?.key
                    ];

                if (typeChangedNormal) {
                    // If matched then loop over its values. This is task level
                    taskColumn.dataValues.attribute.values.map((value) => {
                        if (
                            !isValidValue(
                                {
                                    type: typeChangedNormal, // Get the new type
                                },
                                value.value,
                            )
                        ) {
                            // Save update even it's from database
                            updateValueCases.push(
                                `WHEN id=:task_value_id_${value.id} THEN NULL`,
                            );
                            // Save the replacements
                            valueReplacements[`task_value_id_${value.id}`] =
                                value.id;
                            // Save the id
                            ids.push(`(${value.id})`);
                        }
                    });
                }

                // This gives the values of the check type
                const typeChangedCheck =
                    changes?.typeChangedCheck?.[
                        taskColumn?.dataValues?.attribute?.key
                    ];

                if (typeChangedCheck) {
                    taskColumn.dataValues.attribute.values.map((value) => {
                        if (
                            !isValidValue(
                                {
                                    type: "check",
                                    values: typeChangedCheck, // Take the values
                                },
                                typeChangedCheck,
                            )
                        ) {
                            // Save update even it's from database
                            updateValueCases.push(
                                `WHEN id=:task_value_id_${value.id} THEN NULL`,
                            );
                            // Save the replacements
                            valueReplacements[`task_value_id_${value.id}`] =
                                value.id;
                            // Save the id
                            ids.push(`(${value.id})`);
                        }
                    });
                }
            }

            if (updateValueCases.length) {
                // Join the tasks updates to run them in one statment. Match only the tasks for this plan
                const updateQuery = `
                WITH ids("targetId") AS (
                    VALUES ${ids.join(", ")}
                )
                UPDATE "${Value.tableName}" SET "value" = 
                CASE ${updateValueCases.join(" ")} ELSE "value" END
                FROM ids
                WHERE id = ids."targetId"
            `;

                await sequelize.query(updateQuery, {
                    transaction: localTransaction,
                    replacements: valueReplacements,
                });
            }

            // Check if the transaction is provided then go for it, otherwise don't commit / rollback
            if (!transaction) {
                await localTransaction.commit();
            }
        } catch (err) {
            if (!transaction) {
                await localTransaction.rollback();
            }
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            console.log(err);
        }
    }

    /**
     *  Check the attributes if they are used or not to delete them
     * @param {Attribute[]} attributes
     * @param {import("sequelize").Transaction} transaction
     */
    async deleteNotUsedAttributes(attributes, transaction) {
        let localTransaction = null;
        if (transaction) {
            localTransaction = transaction;
        } else {
            localTransaction = await sequelize.transaction();
        }

        try {
            // Reshape
            const ids = attributes.map((attr) => `(${attr.id})`);

            const q = `
                WITH ids(id) AS (
                    VALUES ${ids.join(", ")}
                ),

                "toDelete" AS (
                    -- Get only those attributes
                    SELECT attribute.id AS id
                    FROM ${Attribute.tableName} attribute
                    JOIN ids ON ids.id = attribute.id

                    -- Keep only those which don't have a relation
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM ${PlanAttribute.tableName} "planAttribute"
                        WHERE "planAttribute"."attributeId" = attribute.id
                    )
                )

                DELETE FROM ${Attribute.tableName}
                WHERE id IN (
                    SELECT id FROM "toDelete"
                )
            `;

            // Delete them
            await sequelize.query(q, {
                transaction: localTransaction,
                type: QueryTypes.DELETE,
            });

            if (!transaction) {
                await localTransaction.commit();
            }
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            if (!transaction) {
                await localTransaction.rollback();
            }

            throw err;
        }
    }

    /**
     * Helper function to check how many plans related to the specific attribute
     * @param {Object} props
     * @param {string} props.id
     * @param {string} props.key
     * @param {string} props.type
     * @param {import("sequelize").Transaction} transaction
     * @returns
     */
    async _checkUsage({ id, key, type, transaction }) {
        return await PlanAttribute.findAll({
            where: {
                ...(id
                    ? { "$attribute.id$": id }
                    : {
                          "$attribute.key$": key,
                          "$attribute.type$": type,
                      }),
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
     * @param {onNoMatch} props.onNoMatch
     * @param {onMatch} props.onMatch
     * @param {onIteration} props.onIteration
     * @param {Object} props.attrsMap                                   - Mapper between attribute keys and the id of it
     * @param {import("sequelize").Transaction} props.transaction       - The transaction, will make the operation faster
     * @param {Object} props.keyTypeMap                                 - The map where the keys is the attribute key and the value is the type of the attribute
     * @param {boolean} props.searchByObject                            - To search by the key and the value of the key it must be {key: type}, `default is false`
     * @param {boolean} props.callIntersection                          - To call onMatch even if onOneMatch or onMoreThanOneMatch got passed or not `default true`
     */
    async _checkDiff({
        keys,
        onOneMatch,
        onIteration,
        onMoreThanOneMatch,
        onNoMatch,
        onMatch,
        attrsMap,
        transaction,
        keyTypeMap,
        searchByObject = false,
        callIntersection = true,
    }) {
        for (let key of keys) {
            // Take the id of that specific attribute, again that is possible because the key itself is unique across the plan
            let data = null;
            if (!searchByObject) {
                data = await this._checkUsage({
                    id: attrsMap[key],
                    transaction,
                });
            } else {
                data = await this._checkUsage({
                    key,
                    type: keyTypeMap?.[key],
                    transaction,
                });
            }

            if (data.length === 0) {
                onNoMatch?.(key, keys);
            } else if (data.length > 1) {
                onMoreThanOneMatch?.(key, data[0].attribute, keys);

                if (onMoreThanOneMatch || callIntersection)
                    onMatch?.(key, data[0].attribute, keys);
            } else {
                onOneMatch?.(key, data[0].attribute, keys);

                if (onOneMatch || callIntersection)
                    onMatch?.(key, data[0].attribute, keys);
            }
            onIteration?.(key, data[0].attribute, keys);
        }
    }

    /**
     * Helper function that accept the replacements object, the array that contains update details and return SQL statement. or empty string, you can add comma in the beginning
     * @param {Object} replacments
     * @param {Object[]} metadataArr
     * @param {boolean} addComma
     * @returns {{cases: string, ids: string[]|number[]}}
     */
    _prepareReplacements(column, replacments, metadataArr, addComma = false) {
        // In case it was empty return empty srting
        if (!metadataArr.length) return "";

        // Save the IDs ready to parse as VALUES in SQLite
        let ids = [];

        let statement = metadataArr.map((obj, i) => {
            // Copy them one by one, faster from spread
            for (let key in obj.replacements) {
                replacments[key] = obj.replacements[key];

                // Copy the id and add it to the ids array
                const [columnKey, id] = key.split("_");
                if (columnKey === "id") ids.push(`(${id})`);
            }

            // Simliar to joins but used the same loop to do more that one thing
            if (i === 0) return obj.statement;
            return `\n${obj.statement}`;
        });

        // Here we need to add comma in case the update cover the two cases
        return {
            cases: `${addComma ? ", " : ""}${column} = CASE ${statement} ELSE ${column}`,
            ids,
        };
    }
}

export default new MetadataServices();
