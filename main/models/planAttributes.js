import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";

class PlanAttribute extends Model {}

PlanAttribute.init(
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true,
        },
        planId: {
            type: DataTypes.BIGINT,
            references: {
                model: "plans",
                key: "id",
            },
        },
        attributeId: {
            type: DataTypes.BIGINT,
            references: {
                model: "attributes",
                key: "id",
            },
        },
    },
    {
        sequelize,
        timestamps: false,
        tableName: "planAttributes",
    },
);

export default PlanAttribute;
