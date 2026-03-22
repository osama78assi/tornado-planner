import sequelize from "../config/sequelize.js";
import { Model, DataTypes } from "sequelize";

class Setting extends Model {}

Setting.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        theme: {
            type: DataTypes.ENUM("light", "dark"),
        },
        pallete: {
            type: DataTypes.ENUM("blue", "orange"),
        },
    },
    {
        sequelize,
        tableName: "settings",
        timestamps: true,
    },
);

export default Setting;
