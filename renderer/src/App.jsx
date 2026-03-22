import { Route, Routes } from "react-router-dom";
import AppLayout from "./AppLayout";
import LandingP from "./pages/LandingP";
import NotesP from "./pages/NotesP";
import MainWorkspaceP from "./pages/MainWorkspacesP";
import NoteP from "./pages/NoteP";
import WorkspacesP from "./pages/WorkspacesP";
import PlanP from "./pages/PlanP";
import NotFoundP from "./pages/NotFoundP";
import MainPlanP from "./pages/MainPlanP";
import WorkspaceP from "./pages/WorkspaceP";

function App() {
    return (
        <Routes>
            <Route path="/" element={<AppLayout />}>
                <Route path="/" element={<LandingP />} />
                <Route path="/notes" element={<NotesP />}>
                    <Route path="/notes/:noteId" element={<NoteP />} />
                </Route>

                <Route path="/workspaces" element={<MainWorkspaceP />}>
                    <Route path="/workspaces" element={<WorkspacesP />} />
                    <Route
                        path="/workspaces/:workspaceId/plans"
                        element={<WorkspaceP />}
                    />
                </Route>

                {/* To not have ugly nested routes */}
                <Route
                    path="/workspaces/:workspaceId/plans/:planId"
                    element={<MainPlanP />}
                >
                    <Route
                        path="/workspaces/:workspaceId/plans/:planId"
                        index
                        element={<PlanP />}
                    />
                </Route>

                <Route path="*" element={<NotFoundP />} />
            </Route>
        </Routes>
    );
}

export default App;
