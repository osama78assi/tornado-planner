export async function getSettings() {
    try {
        const settings = await window.settings.get();

        return settings;
    } catch (err) {
        throw err;
    }
}
