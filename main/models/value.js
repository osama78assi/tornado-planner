import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

class Value extends Model {}

Value.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        value: {
            type: DataTypes.STRING(500),
            allowNull: false,
        },
        attributeId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "attributes",
                key: "id",
            },
        },
        taskId: {
            type: DataTypes.BIGINT,
            references: {
                model: "tasks",
                key: "id",
            },
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: true,
        createdAt: false,
        updatedAt: true,
        tableName: "values",
        indexes: [{ fields: ["value"], type: "BTREE" }],
    },
);

export default Value;
