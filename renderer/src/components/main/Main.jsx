import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import AppHeader from "../ui/AppHeader";

function Main() {
    const { isSidebarToggled } = useSelector((state) => state.navigator);

    let fullWidthClass = "";
    if (isSidebarToggled) {
        fullWidthClass = "main-content_full";
    }

    return (
        <div className={`main-content ${fullWidthClass}`}>
            <div className="main-content_header">
                <AppHeader />
            </div>

            <div className="main-content_body">
                <Outlet />
            </div>
        </div>
    );
}

export default Main;
