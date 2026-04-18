import { FOLDER_NOT_EXIST } from "../errors/folder.js";
import Folder from "../models/folder.js";
import ApplicationError from "../util/applicationError.js";
import { getSafeLimit, mapFilters } from "../util/global.js";

class FolderServices {
    async create(details) {
        try {
            const folder = await Folder.create(details);

            return folder;
        } catch (err) {
            console.log(err);
        }
    }

    async update(id, payload) {
        try {
            await Folder.update(payload, {
                where: { id },
            });

            // In sqlite you need to query
            return await Folder.findByPk(id);
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }

    async destory(id) {
        try {
            const count = await Folder.destroy(id);
            if (count === 0) {
                throw FOLDER_NOT_EXIST;
            }

            return true;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
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
            const count = await Folder.count({
                ...(where ? { where } : {}),
            });

            // Get the safe limit (undefined if loadAll, which Sequelize will ignore)
            const safeLimit = loadAll ? undefined : getSafeLimit(limit);

            // Calculate the offset
            const offset = safeLimit ? (page - 1) * safeLimit : 0;

            // Get folders
            const data = await Folder.findAll({
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

export default new FolderServices();
