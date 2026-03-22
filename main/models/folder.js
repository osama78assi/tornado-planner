import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";
import Note from "./note.js";

class Folder extends Model {}

Folder.init(
    {
        id: {
            type: DataTypes.INTEGER,
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

export default Folder;
