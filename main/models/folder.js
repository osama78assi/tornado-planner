import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Note from "./note.js";

class Folder extends Model {}

Folder.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        workspaceId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            references: {
                model: "workspaces",
                key: "id",
            },
        },
        parentFolderId: {
            type: DataTypes.BIGINT,
            references: {
                model: "folders",
                key: "id",
            },
        },
    },
    {
        sequelize,
        tableName: "folders",
        timestamps: true,
        hooks: {
            beforeCreate(folder) {
                if (folder.name) {
                    folder.name = folder.name.trim();
                }
            },

            beforeBulkCreate(folders) {
                for (const folder of folders) {
                    if (folder.name) {
                        folder.name = folder.name.trim();
                    }
                }
            },
        },
    },
);

// Each folder got many notes
Folder.hasMany(Note, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "notes",
    foreignKey: "folderId",
});

Note.belongsTo(Folder, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    as: "folder",
    foreignKey: "folderId",
});

// Each folder has a parent
Folder.belongsTo(Folder, {
    foreignKey: "folderId",
    as: "parentFolder",
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
});

// Each folder have many children folders
Folder.hasMany(Folder, {
    as: "folders",
    foreignKey: "folderId",
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
});

export default Folder;
