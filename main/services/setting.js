import Setting from "../models/setting.js";

class SettingServices {
    async create(details) {
        try {
            const setting = await Setting.create(details);

            return setting;
        } catch (err) {
            console.log(err);
        }
    }

    async update(id, payload) {
        try {
            await Setting.update(payload, {
                where: { id },
            });

            // In sqlite you need to query
            return await Setting.findByPk(id);
        } catch (err) {
            throw err;
        }
    }

    async get() {
        try {
            const data = await Setting.findAll();

            return data?.[0]?.toJSON() || null;
        } catch (err) {
            throw err;
        }
    }
}

export default new SettingServices();
