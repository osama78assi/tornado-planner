import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import ApplicationError from "../util/applicationError.js";
import { UNINITIALIZED_SETTINGS } from "../errors/global.js";
import isDev from "electron-is-dev";
import { app } from "electron";

let APP_SETTINGS = null;

// Check database file if exists or not and create it
export function getDatabasePath() {
    if (isDev) {
        return join(cwd(), "tornadoDB.db");
    }

    return join(app.getPath("userData"), "tornadoDB.db");
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
