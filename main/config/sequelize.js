import { Sequelize } from "sequelize";
import { getDatabasePath } from "./main.js";

const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: getDatabasePath(),
}); // Example for sqlite

export async function connectDB(params) {
    try {
        await sequelize.authenticate({ logging: false });

        await sequelize.sync({ force: true });

        console.log("connected to database successfully");
    } catch (err) {
        console.log(err);
    }
}

export default sequelize;
