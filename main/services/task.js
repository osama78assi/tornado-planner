import { isValidValue } from "../config/constant.js";
import sequelize from "../config/sequelize.js";
import {
    MISSING_PLAN,
    TASK_WITH_NO_PLAN,
    UNRECOGNIZED_ATTRIBUTE,
} from "../errors/task.js";
import Plan from "../models/plan.js";
import Task from "../models/task.js";
import Workspace from "../models/workspaces.js";
import ApplicationError from "../util/applicationError.js";
import { getSafeLimit, mapFilters } from "../util/global.js";

class TaskServices {
    async create(details) {
        try {
            // Throw if there is no plan
            if (!details.planId) {
                throw TASK_WITH_NO_PLAN;
            }

            // Get the plan
            const plan = await Plan.findByPk(details.planId, {
                attributes: ["id", "metadata"],
            });

            if (!plan) {
                throw MISSING_PLAN;
            }

            // Eleminate the properties that isn't existed
            // Take what is existed after checking if the type is valid or not

            if (details.metadata && typeof details.metadata === "object") {
                for (const key in details.metadata) {
                    // if the key isn't existed throw an error
                    if (!plan.dataValues.metadata[key]) {
                        throw UNRECOGNIZED_ATTRIBUTE(key);
                    }

                    // Here it's exist, check the type.
                    if (
                        !isValidValue(
                            plan.dataValues.metadata[key],
                            details.metadata[key],
                        )
                    ) {
                        throw new ApplicationError(
                            `The value of attribute ${key} doesn't match the type ${plan.dataValues.metadata[key].type}`,
                            "VALUE_NOT_MATCH_TYPE",
                            {
                                key,
                                type: plan.dataValues.metadata[key].type,
                            },
                        );
                    }
                }
            }

            const task = await Task.create(details);

            return task;
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async update(id, payload) {
        try {
            await Task.update(payload, {
                where: { id },
            });

            const newTask = await Task.findByPk(id);

            return newTask;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            throw err;
        }
    }

    async get(page = 1, limit = 10, filters = null) {
        try {
            // Parse sequelize where statement
            let where = null;
            if (filters) {
                where = mapFilters(filters);
            }

            // Get the safe limit
            const safeLimit = getSafeLimit(limit);

            // Get the count
            const count = await Task.count({ ...(where ? { where } : {}) });

            // Calculate the offset
            const offset = (page - 1) * limit;

            // Get tasks
            const data = await Task.findAll({
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

    // Here it includes all
    async search(page = 1, limit = 10, filters = null) {
        try {
            // Parse sequelize where statement
            let where = null;
            if (filters) {
                where = mapFilters(filters);
            }

            // Get the safe limit
            const safeLimit = getSafeLimit(limit);

            // Get the count
            const count = await Task.count({ ...(where ? { where } : {}) });

            // Calculate the offset
            const offset = (page - 1) * limit;

            // Get tasks
            const data = await Task.findAll({
                limit: safeLimit,
                offset,
                ...(where ? { where } : {}),
                include: [
                    {
                        model: Plan,
                        attributes: ["id", "name"],
                        as: "plan",
                        include: [
                            {
                                attributes: ["id", "name"],
                                model: Workspace,
                                as: "workspace",
                            },
                        ],
                    },
                ],
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

    async delete(id) {
        try {
            const count = await Task.destroy({ where: { id } });

            if (count === 0) {
                throw TASK_DELETED;
            }

            return true;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }

    async _updateMetadata(planId, changes, t) {
        // If there is no transaction then create your own
        let transaction = null;
        if (t) {
            transaction = t;
        } else {
            transaction = await sequelize.transaction();
        }

        try {
            // Load all tasks in the memory for specified plan
            // As an optimization later you can reject this process and
            // set to null all new/updated fields if the tasks are too much.
            // But note that this step is rare to happen in the middle of the plan
            const tasks = await Task.findAll({
                where: { planId },
                attributes: ["metadata", "id"],
            });

            // Build foreach task a new update statment
            const updateCases = [];

            tasks.forEach((task) => {
                // Sequelize give to you the JSON as js object
                for (let key in changes) {
                    if (key === "new") {
                        changes["new"].map((newKey) => {
                            task.dataValues.metadata[newKey] = null;
                        });
                    }

                    if (key === "delete") {
                        changes["delete"].map((deleteKey) => {
                            delete task.dataValues.metadata[deleteKey];
                        });
                    }

                    if (key === "typeChangedNormal") {
                        for (let taskKey in changes["typeChangedNormal"]) {
                            // Check if the value match this type then keep it, otherwise set it to null
                            if (
                                !isValidValue(
                                    {
                                        type: changes["typeChangedNormal"][
                                            taskKey
                                        ], // Get the new type
                                    },
                                    task.dataValues.metadata[taskKey],
                                )
                            ) {
                                delete task.dataValues.metadata[taskKey];
                            }
                        }
                    }

                    if (key === "typeChangedCheck") {
                        for (let taskKey in changes["typeChangedCheck"]) {
                            // If it's not correct then delete it
                            if (
                                !isValidValue(
                                    {
                                        type: "check",
                                        values: changes["typeChangedCheck"][
                                            taskKey
                                        ], // Take the values
                                    },
                                    task.dataValues.metadata[taskKey],
                                )
                            ) {
                                delete task.dataValues.metadata[taskKey];
                            }
                        }
                    }

                    if (key === "nameChanged") {
                        for (let oldTaskKey in changes["nameChanged"]) {
                            // Get the new key
                            task.dataValues.metadata[
                                changes["nameChanged"][oldTaskKey]
                            ] = task.dataValues.metadata[oldTaskKey];

                            // Delete the old value after get copied
                            delete task.dataValues.metadata[oldTaskKey];
                        }
                    }
                }

                // Now the task is updated but it still in the memory, apply it in database
                updateCases.push(
                    `WHEN id = ${task.dataValues.id} THEN '${JSON.stringify(task.dataValues.metadata)}'`,
                );
            });

            // Join the tasks updates to run them in one statment. Match only the tasks for this plan
            const updateQuery = `
                UPDATE ${Task.tableName} SET metadata = 
                CASE ${updateCases.join(" ")} END
                WHERE "planId" = ${planId}
            `;

            await sequelize.query(updateQuery, { transaction });

            // Check if the transaction is provided then go for it, otherwise don't commit / rollback
            if (!t) {
                await transaction.commit();
            }
        } catch (err) {
            if (!t) {
                await transaction.rollback();
            }
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            console.log(err);
        }
    }
}

export default new TaskServices();
