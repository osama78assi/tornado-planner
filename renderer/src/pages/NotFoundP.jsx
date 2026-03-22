import MainContainer from "../components/ui/MainContainer";

import SidebarContainer from "../components/ui/SidebarContainer";
import { NavLink } from "react-router-dom";

function NotFoundP() {
    return (
        <>
            <SidebarContainer />
            <MainContainer>
                <div
                    className="text-2xl flex h-full w-full justify-center items-center"
                    onClick={() => nav("/1")}
                >
                    <p className="p-2 bg-red-300 text-(--main-text-color) rounded-xl text-lg">
                        Page not found please return{" "}
                        <NavLink to="/" className="underline">
                            Home
                        </NavLink>
                    </p>
                </div>
            </MainContainer>
        </>
    );
}

export default NotFoundP;
