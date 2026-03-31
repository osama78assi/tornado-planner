import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize.js";
import PlanAttribute from "./planAttributes.js";

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
        timestamps: true,
        createdAt: false,
        tableName: "attributes",
        indexes: [
            {
                fields: ["key", "type"],
                type: "UNIQUE",
                name: "attributes_key_type_unique",
            },
            {
                fields: ["key", "type"],
                type: "BTREE",
                name: "attributes_key_type_btree",
            },
        ],
    },
);

// The PlanAttribute got an attribute
PlanAttribute.belongsTo(Attribute, {
    foreignKey: "attributeId",
    as: "attribute",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

export default Attribute;
