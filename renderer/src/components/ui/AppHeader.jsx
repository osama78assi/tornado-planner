import { useLocation } from "react-router-dom";
import WorkspaceHeader from "../workspace/WorkspaceHeader";
import PlansHeader from "../plan/PlansHeader";
import { getPageFromPath } from "../../util/main";

function AppHeader() {
    const location = useLocation();

    // Determine current page from pathname
    const currentPage = getPageFromPath(location.pathname);

    if (currentPage === "home") {
        return <WorkspaceHeader />;
    }

    if (["plans", "plan"].includes(currentPage)) {
        return <PlansHeader />;
    }


    if (currentPage === "settings") {
        return <div className="flex items-center gap-2" />;
    }

    return (
        <div className="flex items-center gap-2">
            {/* Dynamic content for other pages will be added later */}
        </div>
    );
}

export default AppHeader;
