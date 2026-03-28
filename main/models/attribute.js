import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

class Attribute extends Model {}

Attribute.init(
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        key: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING(7),
        },
    },
    {
        sequelize,
        timestamps: false,
        tableName: "attributes",
        indexes: [
            {
                fields: ["key", "type"],
                type: "UNIQUE",
            },
            {
                fields: ["key", "type"],
                type: "BTREE",
            },
        ],
    },
);

export default Attribute;
