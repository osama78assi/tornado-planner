import { DATE_FORMATS } from "../config/constant.js";
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
            defaultValue: "dark"
        },
        color: {
            type: DataTypes.ENUM("blue", "orange"),
            defaultValue: "blue"
        },
        dateFormat: {
            type: DataTypes.ENUM(Object.keys(DATE_FORMATS)),
            defaultValue: Object.keys(DATE_FORMATS)[0],
        },
    },
    {
        sequelize,
        tableName: "settings",
        timestamps: true,
    },
);

export default Setting;
