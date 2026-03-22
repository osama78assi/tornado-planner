const { contextBridge, ipcRenderer } = require("electron");

(async function () {
    const channels = await ipcRenderer.invoke("get-channels");

    contextBridge.exposeInMainWorld("windowApi", {
        toggleMaximize: () =>
            ipcRenderer.invoke(channels.window.toggleMaximize),
        minimize: () => ipcRenderer.invoke(channels.window.minimize),
        close: () => ipcRenderer.invoke(channels.window.close),
        isMaximized: () => ipcRenderer.invoke(channels.window.maximized),
    });

    contextBridge.exposeInMainWorld("settings", {
        get: () => ipcRenderer.invoke(channels.settings.get),
    });

    contextBridge.exposeInMainWorld("workspaces", {
        create: (payload) =>
            ipcRenderer.invoke(channels.workspaces.create, payload),
        get: (page, limit, filters) =>
            ipcRenderer.invoke(channels.workspaces.get, page, limit, filters),
        update: (id, payload) =>
            ipcRenderer.invoke(channels.workspaces.update, id, payload),
        destroy: (id) => ipcRenderer.invoke(channels.workspaces.destroy, id),
    });

    contextBridge.exposeInMainWorld("plans", {
        create: (payload) => ipcRenderer.invoke(channels.plans.create, payload),
        get: (page, limit, filters) =>
            ipcRenderer.invoke(channels.plans.get, page, limit, filters),
        update: (id, payload) =>
            ipcRenderer.invoke(channels.plans.update, id, payload),
        destroy: (id) => ipcRenderer.invoke(channels.plans.destroy, id),
    });

    contextBridge.exposeInMainWorld("folders", {
        create: (payload) =>
            ipcRenderer.invoke(channels.folders.create, payload),
        get: (page, limit, filters) =>
            ipcRenderer.invoke(channels.folders.get, page, limit, filters),
        update: (id, payload) =>
            ipcRenderer.invoke(channels.folders.update, id, payload),
        destroy: (id) => ipcRenderer.invoke(channels.folders.destroy, id),
    });

    contextBridge.exposeInMainWorld("tasks", {
        create: (payload) => ipcRenderer.invoke(channels.tasks.create, payload),
        get: (page, limit, filters, search) =>
            ipcRenderer.invoke(
                channels.tasks.get,
                page,
                limit,
                filters,
                search,
            ),
        update: (id, payload) =>
            ipcRenderer.invoke(channels.tasks.update, id, payload),
        destroy: (id) => ipcRenderer.invoke(channels.tasks.destroy, id),
    });

    contextBridge.exposeInMainWorld("notes", {
        create: (payload) => ipcRenderer.invoke(channels.notes.create, payload),
        get: (page, limit, filters, search) =>
            ipcRenderer.invoke(
                channels.notes.get,
                page,
                limit,
                filters,
                search,
            ),
        update: (id, payload) =>
            ipcRenderer.invoke(channels.notes.update, id, payload),
        destroy: (id) => ipcRenderer.invoke(channels.notes.destroy, id),
    });

    contextBridge.exposeInMainWorld("constants", {
        get: () => ipcRenderer.invoke(channels.constants.get),
    });
})();
