import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Plan from "./plan.js";
import Note from "./note.js";

class Workspace extends Model {}

Workspace.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        indexes: [
            {
                fields: ["name"],
                type: "UNIQUE",
            },
        ],
        hooks: {
            beforeCreate(workspace) {
                if (workspace.name) {
                    workspace.name = workspace.name.trim();
                }
            },

            beforeBulkCreate(workspaces) {
                for (const workspace of workspaces) {
                    if (workspace.name) {
                        workspace.name = workspace.name.trim();
                    }
                }
            },
        },
        sequelize,
        tableName: "workspaces",
        timestamps: true,
    },
);

// Each workspace have many notes
Workspace.hasMany(Note, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "notes",
    foreignKey: "workspaceId",
});
Note.belongsTo(Workspace, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "workspace",
    foreignKey: "workspaceId",
});
// Each workspace have many plans
Workspace.hasMany(Plan, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "plans",
    foreignKey: "workspaceId",
});
Plan.belongsTo(Workspace, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "workspace",
    foreignKey: "workspaceId",
});

export default Workspace;
