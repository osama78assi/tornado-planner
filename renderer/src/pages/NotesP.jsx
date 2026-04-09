import { useParams } from "react-router-dom";
import { useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { setCurrentPage } from "../state/navigator";

function NotesP() {
    const dispatch = useDispatch();
    const { workspaceId } = useParams();

    useLayoutEffect(() => {
        dispatch(setCurrentPage("workspace"));
    }, [dispatch]);

    return (
        <div className="px-2 py-3">
            <h1 className="text-3xl text-(--main-interactive-color-v1) mb-6 mt-4">
                Notes
            </h1>
            <p className="text-(--main-text-color)">
                Workspace-specific notes for workspace: {workspaceId}
            </p>
        </div>
    );
}

export default NotesP;
