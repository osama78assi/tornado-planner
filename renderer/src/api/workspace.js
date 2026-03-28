export async function getWorkspaces({ page = 1, limit = 10, filters }) {
    const res = await window.workspaces.get({ page, limit, filters });
    if (!res.success) {
        throw new Error(res.message);
    }

    return { data: res.data, pagination: res.pagination };
}

export async function createWorkspace(payload) {
    const res = await window.workspaces.create(payload);

    if (!res.success) {
        throw new Error(res.message);
    }

    return res.data;
}

export async function updateWorkspace(id, payload) {
    const res = await window.workspaces.update({ id, payload });

    if (!res.success) throw new Error(res.message);

    return res.data;
}
