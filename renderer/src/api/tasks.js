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

    const res = await window.tasks.get(page, limit, filters, true);

    if (!res.success) {
        throw new Error(res.message);
    }

    return { data: res.data, pagination: res.pagination };
});
