import { copyFile, fstat } from "fs";
import Setting from "../models/setting.js";
import ApplicationError from "../util/applicationError.js";
import fs from "fs";
import { FOLDER_NOT_EXISTS } from "../errors/setting.js";
import sequelize from "../config/sequelize.js";
import { join } from "path";

class SettingServices {
    async create(details) {
        try {
            const setting = await Setting.create(details);

            return setting;
        } catch (err) {
            console.log(err);
        }
    }

    async update(id, payload) {
        try {
            await Setting.update(payload, {
                where: { id },
            });

            // In sqlite you need to query
            return await Setting.findByPk(id);
        } catch (err) {
            throw err;
        }
    }

    async get() {
        try {
            const data = await Setting.findAll();

            return data?.[0] || null;
        } catch (err) {
            throw err;
        }
    }

    async backup(destination) {
        try {
            // Check if the folder is exists
            if (!fs.existsSync(destination)) {
                throw FOLDER_NOT_EXISTS;
            }

            await sequelize.query(`VACUUM INTO :destination`, {
                replacements: {
                    destination: join(destination, `Tornado-Planner-Database-Backup-${Date.now()}.sql`),
                },
            });

            return true;
        } catch (err) {
            if (!(err instanceof ApplicationError)) {
                console.log(err);
            }

            throw err;
        }
    }
}

export default new SettingServices();
