import { Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import NotesP from "./pages/NotesP";
import NoteP from "./pages/NoteP";
import WorkspacesP from "./pages/WorkspacesP";
import PlanP from "./pages/PlanP";
import NotFoundP from "./pages/NotFoundP";
import WorkspaceP from "./pages/WorkspaceP";
import SettingsP from "./pages/SettingsP";

function App() {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route path="/" element={<WorkspacesP />} />

                <Route
                    path="/workspaces/:workspaceId/plans"
                    element={<WorkspaceP />}
                />
                <Route
                    path="/workspaces/:workspaceId/plans/:planId"
                    element={<PlanP />}
                />

                <Route
                    path="/workspaces/:workspaceId/notes"
                    element={<NotesP />}
                />
                <Route
                    path="/workspaces/:workspaceId/notes/:noteId"
                    element={<NoteP />}
                />

                <Route path="/settings" element={<SettingsP />} />

                <Route path="*" element={<NotFoundP />} />
            </Route>
        </Routes>
    );
}

export default App;
