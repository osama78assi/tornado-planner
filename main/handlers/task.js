import { errorHandler } from "../util/applicationError.js";
import taskServices from "../services/task.js";
import { checkPagination } from "../util/global.js";

class TaskHandlers {
    async create(payload) {
        try {
            const results = await taskServices.create(payload);

            return {
                success: true,
                data: results.toJSON(),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async get(page = 1, limit = 10, filters = null, search = false) {
        try {
            // This will throw an error in case not valid
            checkPagination(page, limit);

            let results;

            if (!search) {
                results = await taskServices.get(page, limit, filters);
            } else {
                // The different here that this function will include all related models to provide more information. as an optimization
                results = await taskServices.search(page, limit, filters);
            }

            return {
                success: true,
                ...results,
                data: results.data.map((task) => task.toJSON()),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async update(id, payload) {
        try {
            const results = await taskServices.update(id, payload);

            return {
                success: true,
                data: results.toJSON(),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async destroy(id) {
        try {
            await taskServices.destory(id);

            return {
                success: true,
                message: "Task deleted successfully",
            };
        } catch (err) {
            return errorHandler(err);
        }
    }
}

export default new TaskHandlers();
