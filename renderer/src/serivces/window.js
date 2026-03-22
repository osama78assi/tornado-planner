export async function toggleWindow(params) {
    try {
        await window.windowApi.toggleMaximize();
    } catch (err) {
        console.log(err);
    }
}

export async function minimizeWindow(params) {
    try {
        await window.windowApi.minimize();
    } catch (err) {
        console.log(err);
    }
}

export async function closeWindow() {
    try {
        await window.windowApi.close();
    } catch (err) {
        console.log(err);
    }
}

export async function isMaximized() {
    try {
        return await window.windowApi.isMaximized();
    } catch (err) {
        console.log(err);
    }
}
