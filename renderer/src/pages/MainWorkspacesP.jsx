import MainContainer from "../components/ui/MainContainer";
import { IoHome } from "react-icons/io5";
import { LuNotebook } from "react-icons/lu";

import SidebarContainer from "../components/ui/SidebarContainer";
import SidebarItem from "../components/ui/SidebarItem";
import BackBtn from "../components/ui/BackBtn";
import Container from "../components/ui/Container";
import { Outlet } from "react-router-dom";

function MainWorkspaceP() {
    return (
        <>
            <SidebarContainer mainBtn={<BackBtn />}>
                <ul className="divide-y divide-[var(--main-divider-color)] pt-2">
                    <SidebarItem icon={<IoHome className="text-xl" />} to={"/"}>
                        Home
                    </SidebarItem>
                    <SidebarItem
                        icon={<LuNotebook className="text-xl" />}
                        to={"/notes"}
                    >
                        Notes
                    </SidebarItem>
                </ul>
            </SidebarContainer>
            <MainContainer>
                <Container>
                    <Outlet />
                </Container>
            </MainContainer>
        </>
    );
}

export default MainWorkspaceP;
