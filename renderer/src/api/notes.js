import { throttleSearch } from "../util/main";

export const searchNotes = throttleSearch(async function ({
    query,
    page = 1,
    limit = 10,
}) {
    const filters = {
        or$: [
            { title: { like$: `%${query}%` } },
            { content: { like$: `%${query}%` } },
        ],
    };

    const res = await window.notes.get({ page, limit, filters, search: true });

    if (!res.success) {
        throw new Error(res.message);
    }

    return { data: res.data, pagination: res.pagination };
});
