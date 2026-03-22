import { errorHandler } from "../util/applicationError.js";
import folderServices from "../services/folder.js";
import { checkPagination } from "../util/global.js";

class FolderHandlers {
    async create(payload) {
        try {
            const results = await folderServices.create(payload);

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

            const results = await folderServices.get(page, limit, filters);

            return {
                success: true,
                ...results,
                data: results.data.map((folder) => folder.toJSON()),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async update(id, payload) {
        try {
            const results = await folderServices.update(id, payload);

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
            await folderServices.destory(id);

            return {
                success: true,
                message: "Folder deleted successfully",
            };
        } catch (err) {
            return errorHandler(err);
        }
    }
}

export default new FolderHandlers();
