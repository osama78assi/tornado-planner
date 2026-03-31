import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

import Task from "./task.js";
import Attribute from "./attribute.js";
import PlanAttribute from "./planAttributes.js";

class Plan extends Model {}

Plan.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        workspaceId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "workspaces",
                key: "id",
            },
        },
        isArchived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        archivedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        indexes: [
            {
                fields: ["name", "workspaceId"],
                type: "UNIQUE",
            },
        ],
        hooks: {
            beforeCreate(plan) {
                if (plan.name) {
                    plan.name = plan.name.trim();
                }

                if (plan.description) {
                    plan.description = plan.description.trim();
                }
            },

            beforeBulkCreate(plans) {
                for (const plan of plans) {
                    if (plan.name) {
                        plan.name = plan.name.trim();
                    }

                    if (plan.description) {
                        plan.description = plan.description.trim();
                    }
                }
            },
        },
        sequelize,
        tableName: "plans",
        timestamps: true,
    },
);

// Each plan have many tasks
Plan.hasMany(Task, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "tasks",
    foreignKey: "planId",
});
Task.belongsTo(Plan, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "plan",
    foreignKey: "planId",
});

// Plan has many attributes (metadata)
Plan.belongsToMany(Attribute, {
    through: PlanAttribute,
    // [label]
    as: "attrs",
    foreignKey: "planId",
    otherKey: "attributeId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

export default Plan;
