import ApplicationError, { errorHandler } from "../util/applicationError.js";
import workspaceServices from "../services/workspace.js";
import { checkPagination } from "../util/global.js";

class WorkspaceHandlers {
    async create(payload) {
        try {
            const results = await workspaceServices.create(payload);

            return {
                success: true,
                data: results.toJSON(),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async get(page = 1, limit = 10, filters = null, loadAll = false) {
        try {
            // This will throw an error in case not valid (skip if loadAll)
            if (!loadAll) {
                checkPagination(page, limit);
            }

            const results = await workspaceServices.get(
                page,
                limit,
                filters,
                loadAll,
            );

            return {
                success: true,
                ...results,
                data: results.data.map((workspace) => workspace.toJSON()),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async update(id, payload) {
        try {
            const results = await workspaceServices.update(id, payload);

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
            await workspaceServices.destory(id);

            return {
                success: true,
                message: "Workspace deleted successfully",
            };
        } catch (err) {
            return errorHandler(err);
        }
    }
}

export default new WorkspaceHandlers();
