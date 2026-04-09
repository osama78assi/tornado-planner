import { useEffect, useState } from "react";
import { GoSidebarExpand } from "react-icons/go";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "../../state/layoutSlice";

function MainContainer({ children }) {
    const { isSidebarToggled, isFloating } = useSelector(
        (state) => state.layout,
    );
    const dispatch = useDispatch();

    const [showBtn, setIsShowBtn] = useState(false);

    function handleToggleSidebar() {
        dispatch(toggleSidebar());
    }

    let fullWidthClass = "";
    if ((!isFloating && isSidebarToggled) || isFloating) {
        fullWidthClass = "main-content_full";
    }

    useEffect(() => {
        // Floating → always visible
        if (isFloating) {
            setIsShowBtn(true);
            return;
        }

        let timer = null;
        // Sidebar collapsed then wait transition time
        if (isSidebarToggled) {
            timer = setTimeout(() => {
                setIsShowBtn(true);
            }, 130);
        } else {
            setIsShowBtn(false);
        }

        return () => clearTimeout(timer);
    }, [isSidebarToggled, isFloating]);

    return (
        <div className={`main-content ${fullWidthClass}`}>
            <div className="main-content_header">
                {showBtn ? (
                    <button
                        className="p-1 cursor-pointer"
                        onClick={handleToggleSidebar}
                    >
                        <GoSidebarExpand className="text-2xl text-(var(--main-text-color)) hover:text-[var(--secondary-text-color)] transition-colors" />
                    </button>
                ) : null}
            </div>

            <div className="main-content_body">{children}</div>
        </div>
    );
}

export default MainContainer;
