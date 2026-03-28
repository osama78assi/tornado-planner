import { errorHandler } from "../util/applicationError.js";
import planServices from "../services/plan.js";
import { checkPagination } from "../util/global.js";
import { checkApplicationSettings } from "../config/main.js";

class PlanHandlers {
    async create(payload) {
        try {
            const results = await planServices.create(payload);

            return {
                success: true,
                data: results.toJSON(),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async get(page = 1, limit = 10, filters = null) {
        try {
            // This will throw an error in case not valid
            checkPagination(page, limit);

            const results = await planServices.get(page, limit, filters);

            return {
                success: true,
                ...results,
                data: results.data.map((plan) => plan.toJSON()),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async update(id, payload) {
        try {
            const results = await planServices.update(id, payload);

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
            await planServices.destory(id);

            return {
                success: true,
                message: "Plan deleted successfully",
            };
        } catch (err) {
            return errorHandler(err);
        }
    }
}

export default new PlanHandlers();
