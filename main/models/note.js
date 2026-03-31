import { Model, DataTypes } from "sequelize";
import sequelize from "../config/sequelize.js";

class Note extends Model {}

Note.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        workspaceId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: "workspaces",
                key: "id",
            },
        },
        folderId: {
            type: DataTypes.BIGINT,
            references: {
                model: "folders",
                key: "id",
            },
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: "notes",
        timestamps: true,
        hooks: {
            beforeCreate(note) {
                if (note.title) {
                    note.title = note.title.trim();
                }
            },

            beforeBulkCreate(notes) {
                for (const note of notes) {
                    if (note.title) {
                        note.title = note.title.trim();
                    }
                }
            },
        },
    },
);

export default Note;
