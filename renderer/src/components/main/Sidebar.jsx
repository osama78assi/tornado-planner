import { GoSidebarCollapse } from "react-icons/go";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../state/navigator";
import { IoLayers } from "react-icons/io5";
import { LuNotebook } from "react-icons/lu";
import { useParams } from "react-router-dom";
import SidebarItem from "../ui/SidebarItem";
import BackBtn from "../ui/BackBtn";
import { getPageFromPath } from "../../util/main";
import { useEffect } from "react";

function Sidebar() {
    const { isSidebarToggled, defaultLayout } = useSelector(
        (state) => state.navigator,
    );
    const dispatch = useDispatch();
    const nav = useNavigate();
    const location = useLocation();
    const { workspaceId } = useParams();

    // Determine current page from pathname
    const currentPage = getPageFromPath(location.pathname);

    // Set initial sidebar state based on current page
    const isHome = currentPage === "home";
    const isSettings = currentPage === "settings";
    const isDefaultLayout = defaultLayout.includes(currentPage);

    // Auto-toggle sidebar based on page when navigating
    useEffect(() => {
        if (isHome && !isSidebarToggled) {
            dispatch(toggleSidebar());
        } else if (!isHome && isSidebarToggled && !isDefaultLayout) {
            dispatch(toggleSidebar());
        }
    }, [currentPage]);

    function handleToggleSidebar() {
        if (isDefaultLayout) return;
        dispatch(toggleSidebar());
    }

    // Some animation and behaviors when the sidebar is toggled or not
    const navItemOpacity = isDefaultLayout ? "opacity-0" : "opacity-100";
    const toggleBtnOpacity = isDefaultLayout ? "opacity-0" : "opacity-100";
    const toggleBtnCursor = isDefaultLayout
        ? "cursor-default!"
        : "cursor-pointer";

    let sidebarClass = "sidebar";
    if (isSidebarToggled) {
        sidebarClass += " sidebar_collapsed";
    }

    return (
        <div className={sidebarClass}>
            <div className={isSidebarToggled ? "w-16" : "w-40"}>
                <div
                    className={`sidebar-header ${isSidebarToggled && !isSettings && !isHome ? "flex-col! h-fit!" : ""}`}
                >
                    <BackBtn
                        className={`${isHome ? "opacity-0 cursor-default!" : "opacity-100"} ${isSettings ? "translate-x-[8px]" : ""}`}
                    />

                    <button
                        className="cursor-pointer p-[0.2rem] text-(--main-interactive-color-v1) hover:text-(--main-interactive-color-v2) transition-colors outline-none! border-none! focus:outline-none! focus-within:outline-none! flex-1"
                        onClick={() => {
                            nav("/");
                        }}
                    >
                        {isSidebarToggled ? null : "Tornado"}
                    </button>

                    <button
                        className={`p-1 transition-opacity duration-300 outline-none border-none focus:outline-none! focus-within:outline-none! ${toggleBtnCursor} ${toggleBtnOpacity}`}
                        onClick={handleToggleSidebar}
                    >
                        <GoSidebarCollapse className="text-2xl text-(--main-text-color-v3) hover:text-(--secondary-text-v2) transition-colors" />
                    </button>
                </div>

                <ul
                    className={`divide-y divide-(--main-divider-color) pt-2 transition-opacity duration-300 ${navItemOpacity}`}
                >
                    <SidebarItem
                        icon={<IoLayers className="text-xl" />}
                        to={`/workspaces/${workspaceId}/plans`}
                        disabled={isDefaultLayout}
                        collapsed={isSidebarToggled}
                    >
                        Plans
                    </SidebarItem>
                    <SidebarItem
                        icon={<LuNotebook className="text-xl" />}
                        to={`/workspaces/${workspaceId}/notes`}
                        disabled={isDefaultLayout}
                        collapsed={isSidebarToggled}
                    >
                        Notes
                    </SidebarItem>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
