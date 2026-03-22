import { existsSync, writeFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";

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
        const { default: settingServices } =
            await import("../services/setting.js");

        let settings = await settingServices.get();

        if (!settings) {
            settings = await settingServices.create({
                theme: "dark",
                pallete: "blue",
            });
        }

        return settings.toJSON();
    } catch (err) {
        console.log(err);
        return {};
    }
}
