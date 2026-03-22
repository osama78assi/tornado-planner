import MainContainer from "../components/ui/MainContainer";
import { IoLayers } from "react-icons/io5";
import { LuNotebook } from "react-icons/lu";

import SidebarContainer from "../components/ui/SidebarContainer";
import SidebarItem from "../components/ui/SidebarItem";
import Container from "../components/ui/Container";
import { getDayStatus } from "../util/main";
import Search from "../components/landing/Search";

function LandingP() {
    return (
        <>
            <SidebarContainer>
                <ul className="divide-y divide-[var(--main-divider-color)] pt-2">
                    <SidebarItem
                        icon={<IoLayers className="text-xl" />}
                        to={"/workspaces"}
                    >
                        Workspaces
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
                    <div className="py-4">
                        <span className="inline-flex -mb-4 text-sm text-(--thirdary-text-color)">
                            {getDayStatus()}
                        </span>
                        <h1 className="text-3xl text-(--main-text-color) font-bold">
                            Let's plan{" "}
                            <span className="text-(--main-interactive-color-v1)">
                                mate...
                            </span>
                        </h1>
                    </div>

                    <Search />

                    <div className="py-4"></div>
                </Container>
            </MainContainer>
        </>
    );
}

export default LandingP;
