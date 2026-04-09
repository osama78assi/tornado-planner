import { isValidValue } from "../config/constant.js";
import sequelize from "../config/sequelize.js";
import {
    MISSING_PLAN,
    TASK_WITH_NO_PLAN,
    UNRECOGNIZED_ATTRIBUTE,
    VALUE_NOT_MATCH_TYPE,
} from "../errors/task.js";
import Attribute from "../models/attribute.js";
import Plan from "../models/plan.js";
import PlanAttribute from "../models/planAttributes.js";
import Task from "../models/task.js";
import Value from "../models/value.js";
import Workspace from "../models/workspaces.js";
import ApplicationError from "../util/applicationError.js";
import { getSafeLimit, mapFilters } from "../util/global.js";
import metadataServices from "./metadata.js";

class TaskServices {
    async create(details) {
        // Mental pipeline:
        // Get plan metadata -> validate -> create
        const transaction = await sequelize.transaction();

        try {
            // Throw if there is no plan
            if (!details.planId) {
                throw TASK_WITH_NO_PLAN;
            }

            // Get the plan
            const plan = await Plan.findByPk(details.planId, {
                attributes: ["id", "metadata"],
                include: [
                    {
                        model: Attribute,
                        as: "attrs",
                        through: {
                            attributes: [],
                        },
                    },
                ],
                transaction,
            });

            if (!plan) {
                throw MISSING_PLAN;
            }

            // Create the task
            let task = null;

            // Update the object to create
            const valuesToCreate = await this._sanitize(
                plan,
                details.metadata,
                async () => {
                    task = await Task.create(details, { transaction });
                    return task.id;
                },
            );

            // Upsert the values
            await metadataServices.upsertValues(valuesToCreate, transaction);

            // Return the reshaped one
            const finalTask = await this.getById(task.id, transaction);

            await transaction.commit();

            return finalTask;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            await transaction.rollback();
            throw err;
        }
    }

    async update(id, payload) {
        const transaction = await sequelize.transaction();
        try {
            // That is the core case but in case it's not updating task's user defined columns this logic will be skipped
            if (payload.metadata) {
                // Get the plan
                const plan = (
                    await Task.findByPk(id, {
                        attributes: ["id"],
                        include: [
                            {
                                model: Plan,
                                as: "plan",
                                include: [
                                    {
                                        model: Attribute,
                                        as: "attrs",
                                        through: {
                                            attributes: [],
                                        },
                                    },
                                ],
                            },
                        ],
                        transaction,
                    })
                ).plan;

                // Update the object to create
                valuesToCreate = await this._sanitize(
                    plan,
                    payload.metadata,
                    () => id, // Just pass the id
                );
                // Upsert the values
                await metadataServices.upsertValues(
                    valuesToCreate,
                    transaction,
                );
            }

            await Task.update(payload, {
                where: { id },
                transaction,
            });

            const newTask = await this.getById(id, transaction);

            await transaction.commit();

            return newTask;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            await transaction.rollback();
            throw err;
        }
    }

    async getAll(page = 1, limit = 10, filters = null) {
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
                include: [
                    {
                        model: Attribute,
                        as: "metadata",
                    },
                ],
                limit: safeLimit,
                offset,
                ...(where ? { where } : {}),
            });

            // Calculate the remaining pages
            const pages = Math.ceil(count / limit);

            return {
                data: this._reshape(data),
                pagination: { pages, count },
            };
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }

    async getById(id, transaction) {
        let localTransaction = null;
        if (transaction) {
            localTransaction = transaction;
        } else {
            localTransaction = await sequelize.transaction();
        }

        try {
            const task = await Task.findByPk(id, {
                include: [
                    {
                        model: Attribute,
                        as: "metadata",
                        through: {
                            attributes: ["value"],
                        },
                    },
                ],
                transaction: localTransaction,
            });

            if (!transaction) await localTransaction.commit();

            return this._reshape(task);
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            if (!transaction) await localTransaction.rollback();

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
                data: this._reshape(data),
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

    /**
     * Helper function to move the attribute 'value' one level
     * @param  {Task|Task[]} tasks array or single task
     * @returns {Task|Task[]} task or tasks
     */
    _reshape(tasks) {
        if (Array.isArray(tasks)) {
            return tasks.map(this._group);
        }

        return this._group(tasks);
    }

    /**
     *
     * @param {Task} task
     */
    _group(task) {
        // Prepare the columns
        task.columns = {};
        task.dataValues.columns = task.columns;
        task?.metadata?.forEach((column, i) => {
            task.columns[column.key] = column.Value.value;
        });

        // Make it readable in the frontend
        delete task.metadata;
        delete task.dataValues.metadata;

        return task;
    }

    /**
     * Helper function to sanitize the tasks user defined values and return the ready to create/update "value" objects
     *
     * **Note:** Please make sure to include the Attribute on the plan before sending it
     * @param {Plan} plan
     * @param {Object} metadata - Valid metadata object
     * @param {Promise<string>|() => string} getTaskId - Can be asnyc function to get the task id in case it was create
     * @returns
     */
    async _sanitize(plan, metadata, getTaskId) {
        try {
            // Make lookup faster
            const columnsLookup = {};

            // Prepare the tasks value to create
            let valuesToCreate = plan.attrs.map((attribute) => {
                // Add empty object for now
                columnsLookup[attribute.key] = null;

                return {
                    attributeId: attribute.id,

                    // Save the key to lookup later
                    key: attribute.key,
                };
            });

            if (metadata && typeof metadata === "object") {
                for (const key in metadata) {
                    // if the key isn't existed throw an error
                    if (!plan.dataValues.metadata[key]) {
                        throw UNRECOGNIZED_ATTRIBUTE(key);
                    }

                    // Here it's exist, check the type.
                    if (
                        !isValidValue(
                            plan.dataValues.metadata[key],
                            metadata[key],
                        )
                    ) {
                        throw VALUE_NOT_MATCH_TYPE(
                            key,
                            plan.dataValues.metadata[key].type,
                        );
                    }

                    // Save the value, remember the key here is the same as the key in the attribute table
                    columnsLookup[key] = metadata[key];
                }
            }

            const taskId = await getTaskId?.();

            // Update the object to create
            return valuesToCreate.map((attr) => ({
                planId: plan.id,
                attributeId: attr.attributeId,
                taskId,
                value: columnsLookup[attr.key], // Get the value
            }));
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }
}

export default new TaskServices();
