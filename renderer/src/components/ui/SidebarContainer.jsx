import { GoSidebarCollapse } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import HomeBtn from "./HomeBtn";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../state/layoutSlice";

function SidebarContainer({ mainBtn = null, children }) {
    const { isSidebarToggled, isFloating } = useSelector(
        (state) => state.layout,
    );
    const dispatch = useDispatch();

    function handleToggleSidebar() {
        dispatch(toggleSidebar());
    }

    let toggledClass = "";

    if (!isFloating && isSidebarToggled) {
        toggledClass = "sidebar_toggled";
    }

    if (isFloating && isSidebarToggled) {
        toggledClass = "sidebar_floating sidebar_floating_hidden";
    }

    if (isFloating && !isSidebarToggled) {
        toggledClass = "sidebar_floating";
    }

    return (
        <div className={`sidebar ${toggledClass}`}>
            <div className="w-50">
                <div className="sidebar-header">
                    {mainBtn ? mainBtn : <HomeBtn />}

                    {!isFloating ? (
                        <button
                            className="p-1 cursor-pointer"
                            onClick={handleToggleSidebar}
                        >
                            <GoSidebarCollapse className="text-2xl text-[var(--main-text-color-v3)] hover:text-[var(--secondary-text-v2)] transition-colors" />
                        </button>
                    ) : null}
                </div>

                {children}
            </div>
        </div>
    );
}

export default SidebarContainer;
