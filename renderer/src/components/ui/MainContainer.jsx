import { useEffect, useState } from "react";
import { GoSidebarExpand } from "react-icons/go";
import { useMainLayoutContext } from "./MainProvider";


function MainContainer({ children }) {
    const { isSidebarToggled, isFloating, toggleSidebar } =
        useMainLayoutContext();

    const [showBtn, setIsShowBtn] = useState(false);

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
                        onClick={toggleSidebar}
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
