import { useParams } from "react-router-dom";

function NoteP() {
    const { workspaceId, noteId } = useParams();

    return (
        <div className="px-2 py-3">
            <h1 className="text-3xl text-(--main-interactive-color-v1) mb-6 mt-4">
                Note Details
            </h1>
            <p className="text-(--main-text-color)">
                Workspace: {workspaceId}, Note: {noteId}
            </p>
        </div>
    );
}

export default NoteP;
