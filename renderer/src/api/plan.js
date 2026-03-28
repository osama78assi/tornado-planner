export async function getPlans({ page = 1, limit = 10, filters }) {
    const res = await window.plans.get({ page, limit, filters });

    if (!res.success) {
        throw new Error(res.message);
    }
    console.log('\n##### res ########\n', res, '\n#############\n');

    return { data: res.data, pagination: res.pagination };
}

export async function createPlan(payload) {
    const res = await window.plans.create(payload);

    if (!res.success) {
        throw new Error(res.message);
    }

    return res.data;
}

export async function updatePlan(id, payload) {
    const res = await window.plans.update({ id, payload });

    if (!res.success) throw new Error(res.message);

    return res.data;
}
