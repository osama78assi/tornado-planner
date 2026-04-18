// This is the global events in Tornado Planner
const channels = {
    window: {
        toggleMaximize: "window:toggle-maximize",
        minimize: "window:minimize",
        close: "window:close",
        maximized: "window:maximized",
    },

    settings: {
        get: "settings:get",
        update: "settings:set",
        pickBackupFolder: "settings:pickBackupFolder",
        exportBackup: "settings:exportBackup"
    },

    constants: {
        get: "constants:get",
    },

    workspaces: {
        get: "workspaces:get",
        create: "workspaces:create",
        update: "workspaces:update",
        destroy: "workspaces:destroy",
    },

    tasks: {
        get: "tasks:get",
        create: "tasks:create",
        update: "tasks:update",
        destroy: "tasks:destroy",
    },

    plans: {
        get: "plans:get",
        create: "plans:create",
        update: "plans:update",
        destroy: "plans:destroy",
    },

    notes: {
        get: "notes:get",
        create: "notes:create",
        update: "notes:update",
        destroy: "notes:destroy",
    },

    folders: {
        get: "folders:get",
        create: "folders:create",
        update: "folders:update",
        destroy: "folders:destroy",
    },
};

export default channels;
