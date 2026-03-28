import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import ApplicationError from "../util/applicationError.js";
import { UNINITIALIZED_SETTINGS } from "../errors/global.js";

let APP_SETTINGS = null;

// Check database file if exists or not and create it
export function getDatabasePath() {
    try {
        const path = join(cwd(), "tornadoDB.db");

        // Check if file is exists
        const isExist = existsSync(path);

        if (!isExist) {
            // Create the file
            writeFileSync(path, "");
        }

        return path;
    } catch (err) {
        console.log(err);
    }
}

// If there is no settings then create one
export async function checkApplicationSettings() {
    try {
        if (APP_SETTINGS) return APP_SETTINGS;

        const { default: settingServices } =
            await import("../services/setting.js");

        let settings = await settingServices.get();

        if (!settings) {
            settings = await settingServices.create({
                theme: "dark",
                pallete: "blue",
            });
        }

        // Assign the application settings
        APP_SETTINGS = settings.dataValues;

        return settings.toJSON();
    } catch (err) {
        console.log(err);
        return {};
    }
}

export function getApplicationSettingsSync() {
    if (!APP_SETTINGS) {
        throw UNINITIALIZED_SETTINGS;
    }
    return APP_SETTINGS;
}
