import { NOTE_NOT_EXIST } from "../errors/note.js";
import Folder from "../models/folder.js";
import Note from "../models/note.js";
import Plan from "../models/plan.js";
import Workspace from "../models/workspaces.js";
import ApplicationError from "../util/applicationError.js";
import { getSafeLimit, mapFilters } from "../util/global.js";

class NoteServices {
    async create(details) {
        try {
            const note = await Note.create(details);

            return note;
        } catch (err) {
            console.log(err);
        }
    }

    async update(id, payload) {
        try {
            await Note.update(payload, {
                where: {id},
            });

            // In sqlite you need to query
            return await Note.findByPk(id);
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }

    async destory(id) {
        try {
            const count = await Note.destroy(id);
            if (count === 0) {
                throw NOTE_NOT_EXIST;
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
            const count = await Note.count({
                ...(where ? { where } : {}),
            });

            // Calculate the offset
            const offset = (page - 1) * limit;

            // Get notes
            const data = await Note.findAll({
                limit: safeLimit,
                offset,
                ...(where ? { where } : {}),
                include: [],
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

    // Here it includes everything
    async search(page = 1, limit = 10, filters = null) {
        try {
            // Build the where statement
            let where = null;
            if (filters) {
                where = mapFilters(filters);
            }

            // Get the safe limit
            const safeLimit = getSafeLimit(limit);

            // Get the count
            const count = await Note.count({
                ...(where ? { where } : {}),
            });

            // Calculate the offset
            const offset = (page - 1) * limit;

            // Get notes
            const data = await Note.findAll({
                limit: safeLimit,
                offset,
                ...(where ? { where } : {}),
                include: [
                    {
                        model: Folder,
                        attributes: ["id", "name"],
                        as: "folder",
                    },
                    {
                        model: Plan,
                        as: "plan",
                        attributes: ["id", "name"],
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
}

export default new NoteServices();
