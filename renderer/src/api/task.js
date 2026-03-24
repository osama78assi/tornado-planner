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

    const res = await window.tasks.get({page, limit, filters, search: true});

    if (!res.success) {
        throw new Error(res.message);
    }

    return { data: res.data, pagination: res.pagination };
});

export async function getTasks({ limit, filters, page }) {
    const res = await window.tasks.get({ limit, filters, page });

    console.log("\n#############\n", res, "\n#############\n");

    if (!res.success) {
        throw new Error(res.message);
    }

    return { data: res.data, pagination: res.pagination };
}
