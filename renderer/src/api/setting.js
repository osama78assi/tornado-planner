export async function pickBackupFolder() {
    const res = await window.settings.pickBackupFolder();

    if (!res.success) {
        throw new Error(res.message);
    }

    return res.data;
}

export async function exportBackup(destination) {
    const res = await window.settings.exportBackup(destination);

    if (!res.success) {
        throw new Error(res.message);
    }

    return res.message;
}
