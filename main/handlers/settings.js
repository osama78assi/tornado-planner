import { errorHandler } from "../util/applicationError.js";
import settingServices from "../services/setting.js";
import { dialog } from "electron";

class SettingsHandlers {
    async get() {
        try {
            const result = await settingServices.get();

            return {
                success: true,
                data: result ? result.toJSON() : null,
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async update(id, payload) {
        try {
            const result = await settingServices.update(id, payload);

            return {
                success: true,
                data: result.toJSON(),
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async pickBackupFolder() {
        try {
            const result = await dialog.showOpenDialog({
                properties: ["openDirectory"],
            });

            if (!result.canceled) {
                return {
                    success: true,
                    data: result.filePaths[0],
                };
            }

            return {
                success: true,
                data: null,
            };
        } catch (err) {
            return errorHandler(err);
        }
    }

    async exportBackup(destination) {
        try {
            await settingServices.backup(destination);

            return {
                success: true,
                message: "Backup exported successfully",
            };
        } catch (err) {
            return errorHandler(err);
        }
    }
}

export default new SettingsHandlers();
