import { GoSidebarCollapse } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../state/navigator";
import { IoLayers } from "react-icons/io5";
import { LuNotebook } from "react-icons/lu";
import { useParams } from "react-router-dom";
import SidebarItem from "../ui/SidebarItem";

function Sidebar() {
    const { isSidebarToggled, currentPage } = useSelector(
        (state) => state.navigator,
    );
    const dispatch = useDispatch();
    const nav = useNavigate();
    const { workspaceId } = useParams();

    function handleToggleSidebar() {
        if (currentPage === "home") return;
        dispatch(toggleSidebar());
    }

    const isHome = currentPage === "home";
    const navItemOpacity = isHome ? "opacity-0" : "opacity-100";
    const toggleBtnOpacity = isHome ? "opacity-0" : "opacity-100";
    const toggleBtnCursor = isHome ? "cursor-default!" : "cursor-pointer";

    let sidebarClass = "sidebar";
    if (isSidebarToggled) {
        sidebarClass += " sidebar_collapsed";
    }

    return (
        <div className={sidebarClass}>
            <div className={isSidebarToggled ? "w-16" : "w-40"}>
                <div className="sidebar-header">
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
                        disabled={isHome}
                        collapsed={isSidebarToggled}
                    >
                        Plans
                    </SidebarItem>
                    <SidebarItem
                        icon={<LuNotebook className="text-xl" />}
                        to={`/workspaces/${workspaceId}/notes`}
                        disabled={isHome}
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
