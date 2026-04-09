import { useSelector } from "react-redux";
import WorkspaceHeader from "../workspace/WorkspaceHeader";

function AppHeader() {
    const { currentPage } = useSelector((state) => state.navigator);

    if (currentPage === "home") {
        return <WorkspaceHeader />;
    }

    return (
        <div className="flex items-center gap-2">
            {/* Dynamic content for other pages will be added later */}
        </div>
    );
}

export default AppHeader;
