import { WORKSPACE_NOT_EXIST } from "../errors/workspace.js";
import Workspace from "../models/workspaces.js";
import ApplicationError from "../util/applicationError.js";
import { getSafeLimit, mapFilters } from "../util/global.js";

class WorkspaceServices {
    async create(details) {
        try {
            const workspace = await Workspace.create(details);

            return workspace;
        } catch (err) {
            console.log(err);
        }
    }

    async update(id, payload) {
        try {
            await Workspace.update(payload, {
                where: { id },
            });

            // In sqlite you need to query
            return await Workspace.findByPk(id);
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }

    async destory(id) {
        try {
            const count = await Workspace.destroy(id);
            if (count === 0) {
                throw WORKSPACE_NOT_EXIST;
            }

            return true;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }
            throw err;
        }
    }

    async get(page = 1, limit = 10, filters = null) {
        try {
            // Build the where statement
            let where = null;
            if (filters) {
                where = mapFilters(filters);
            }

            // Get the safe limit
            const safeLimit = getSafeLimit(limit);

            // Get the count
            const count = await Workspace.count({
                ...(where ? { where } : {}),
            });

            // Calculate the offset
            const offset = (page - 1) * limit;

            // Get workspaces
            const data = await Workspace.findAll({
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
}

export default new WorkspaceServices();
