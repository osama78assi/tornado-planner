import { app, BrowserWindow, nativeTheme } from "electron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { connectDB } from "./config/sequelize.js";
import { ipcMain } from "electron/main";
import channels from "./config/channels.js";
import { checkApplicationSettings, getApplicationSettingsSync } from "./config/main.js";
import settingServices from "./services/setting.js";
import { testDate } from "./config/scripts.js";
import { errorHandler } from "./util/applicationError.js";
import workspaceHandlers from "./handlers/workspace.js";
import planServices from "./handlers/plan.js";
import folderHandlers from "./handlers/folder.js";
import taskHandlers from "./handlers/task.js";
import notesHandlers from "./handlers/note.js";
import {
    getDefaultMetadata,
    DEFAULT_SCHEMA_TYPES,
    DATE_FORMATS,
} from "./config/constant.js";

// Global variables
const __dirname = dirname(fileURLToPath(import.meta.url));

function createWindow() {
    const window = new BrowserWindow({
        width: 800,
        height: 800,
        minHeight: 600,
        minWidth: 500,
        webPreferences: {
            preload: join(__dirname, "../preload/preload.js"),
        },
        frame: false,
    });

    window.loadURL("http://localhost:5173/");

    return window;
}

// Using custom frame so this provide the basics functions
function initWindowApi() {
    ipcMain.handle(channels.window.minimize, (event) => {
        // Even is auto sent. webcontent reprsenet the renderer process (window)
        // So we are getting the window from this process that send to us
        const win = BrowserWindow.fromWebContents(event.sender);
        win.minimize();
    });

    ipcMain.handle(channels.window.toggleMaximize, (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    });

    ipcMain.handle(channels.window.close, (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);
        window.close();
    });

    ipcMain.handle(channels.window.maximized, (event) => {
        const window = BrowserWindow.fromWebContents(event.sender);

        return window.isMaximized();
    });
}

function initWorkspacesApi() {
    ipcMain.handle(channels.workspaces.create, async (_, payload) => {
        return await workspaceHandlers.create(payload);
    });

    ipcMain.handle(
        channels.workspaces.get,
        async (_, page = 1, limit = 10, filters = null) => {
            return await workspaceHandlers.get(page, limit, filters);
        },
    );

    ipcMain.handle(channels.workspaces.update, async (_, id, payload) => {
        return await workspaceHandlers.update(id, payload);
    });

    ipcMain.handle(channels.workspaces.destroy, async (_, id) => {
        return await workspaceHandlers.destroy(id);
    });
}

function initPlansApi() {
    ipcMain.handle(channels.plans.create, async (_, payload) => {
        return await planServices.create(payload);
    });

    ipcMain.handle(
        channels.plans.get,
        async (_, page = 1, limit = 10, filters = null) => {
            return await planServices.get(page, limit, filters);
        },
    );

    ipcMain.handle(channels.plans.update, async (_, id, payload) => {
        return await planServices.update(id, payload);
    });

    ipcMain.handle(channels.plans.destroy, async (_, id) => {
        return await planServices.destroy(id);
    });
}

function initFoldersApi() {
    ipcMain.handle(channels.folders.create, async (_, payload) => {
        return await folderHandlers.create(payload);
    });

    ipcMain.handle(
        channels.folders.get,
        async (_, page = 1, limit = 10, filters = null) => {
            return await folderHandlers.get(page, limit, filters);
        },
    );

    ipcMain.handle(channels.folders.update, async (_, id, payload) => {
        return await folderHandlers.update(id, payload);
    });

    ipcMain.handle(channels.folders.destroy, async (_, id) => {
        return await folderHandlers.destroy(id);
    });
}

function initTasksApi() {
    ipcMain.handle(channels.tasks.create, async (_, payload) => {
        return await taskHandlers.create(payload);
    });

    ipcMain.handle(
        channels.tasks.get,
        async (_, page = 1, limit = 10, filters = null, search = false) => {
            return await taskHandlers.get(page, limit, filters, search);
        },
    );

    ipcMain.handle(channels.tasks.update, async (_, id, payload) => {
        return await taskHandlers.update(id, payload);
    });

    ipcMain.handle(channels.tasks.destroy, async (_, id) => {
        return await taskHandlers.destroy(id);
    });
}

function initNotesApi() {
    ipcMain.handle(channels.notes.create, async (_, payload) => {
        return await notesHandlers.create(payload);
    });

    ipcMain.handle(
        channels.notes.get,
        async (_, page = 1, limit = 10, filters = null, search = false) => {
            return await notesHandlers.get(page, limit, filters, search);
        },
    );

    ipcMain.handle(channels.notes.update, async (_, id, payload) => {
        return await notesHandlers.update(id, payload);
    });

    ipcMain.handle(channels.notes.destroy, async (_, id) => {
        return await notesHandlers.destroy(id);
    });
}

function initSettingsApi() {
    ipcMain.handle(channels.settings.get, async () => {
        return getApplicationSettingsSync();
    });
}

function initConstantsApi() {
    ipcMain.handle(channels.constants.get, async () => {
        return {
            DEFAULT_METADATA: getDefaultMetadata(),
            DEFAULT_SCHEMA_TYPES,
            DATE_FORMATS,
        };
    });
}

async function main(params) {
    // Wait the app to be ready
    await app.whenReady();

    // Expose all events object to be able to listen in the renderer
    ipcMain.handle("get-channels", async () => {
        return channels;
    });

    // Create the window
    const window = createWindow();

    // Connect to database
    await connectDB();

    // await checkDatabaseFile();
    
    // Check settings
    await checkApplicationSettings();

    // Add test data
    await testDate();

    // Expose all window related functions
    initWindowApi();

    // Expose all settings related functions
    initSettingsApi();

    // Expsoe default information
    initConstantsApi();

    // Expose all features APIs
    initWorkspacesApi();
    initPlansApi();
    initFoldersApi();
    initTasksApi();
    initNotesApi();

    // Close the window on windows and linux
    app.on("window-all-closed", () => {
        if (process.platform !== "darwin") app.quit();
    });

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
}

main();
