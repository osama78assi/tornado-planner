import { throttleSearch } from "../util/main";

export const searchTasks = throttleSearch(async function ({
    query,
    page = 1,
    limit = 10,
}) {
    const filters = {
        or$: [
            { title: { like$: `%${query}%` } },
            { description: { like$: `%${query}%` } },
        ],
    };

    const res = await window.tasks.get({ page, limit, filters, search: true });

    if (!res.success) {
        throw new Error(res.message);
    }

    return { data: res.data, pagination: res.pagination };
});

export async function getTasks({ limit, filters, page, loadAll = false }) {
    const res = await window.tasks.get({ limit, filters, page, loadAll });

    if (!res.success) {
        throw new Error(res.message);
    }

    return { data: res.data, pagination: res.pagination };
}

export async function createTask(payload) {
    const res = await window.tasks.create(payload);

    if (!res.success) {
        throw new Error(res.message);
    }

    return res.data;
}

export async function updateTask(id, payload) {
    const res = await window.tasks.update({ id, payload });

    if (!res.success) {
        throw new Error(res.message);
    }

    return res.data;
}

export async function deleteTask(id) {
    const res = await window.tasks.destroy(id);

    if (!res.success) {
        throw new Error(res.message);
    }

    return res.message;
}
