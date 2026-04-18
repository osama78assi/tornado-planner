import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Attribute from "./attribute.js";
import Value from "./value.js";

class Task extends Model {}

Task.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(600),
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        planId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "plans",
                key: "id",
            },
        },
        completed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: "tasks",
        timestamps: true,

        hooks: {
            beforeCreate(task) {
                if (task.title) {
                    task.title = task.title.trim();
                }

                if (task.description) {
                    task.description = task.description.trim();
                }
            },

            beforeBulkCreate(tasks) {
                for (const task of tasks) {
                    if (task.title) {
                        task.title = task.title.trim();
                    }

                    if (task.description) {
                        task.description = task.description.trim();
                    }
                }
            },
        },
    },
);

// The task got an attribute through a value
Task.belongsToMany(Attribute, {
    through: Value,
    // [label]
    as: "metadata",
    foreignKey: "taskId",
    otherKey: "attributeId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

export default Task;
