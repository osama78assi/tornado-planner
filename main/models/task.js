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
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(300),
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        style: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        planId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "plans",
                key: "id",
            },
        },
        folderId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "folders",
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
    as: "metadata_v1",
    foreignKey: "taskId",
    otherKey: "attributeId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

export default Task;
