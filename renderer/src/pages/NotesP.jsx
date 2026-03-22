import { useEffect, useRef, useState } from "react";
import { GoSidebarCollapse, GoSidebarExpand } from "react-icons/go";
import MainContainer from "../components/ui/MainContainer";
import { IoLayers } from "react-icons/io5";
import { LuNotebook } from "react-icons/lu";

import SidebarContainer from "../components/ui/SidebarContainer";
import SidebarItem from "../components/ui/SidebarItem";
import BackBtn from "../components/ui/BackBtn";

function NotesP() {
    return (
        <>
            <SidebarContainer mainBtn={<BackBtn />}>
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
                <div className="w-[95%] mx-auto p-[0.5rem]">
                    <h1 className="text-2xl">Notes</h1>
                </div>
            </MainContainer>
        </>
    );
}

export default NotesP;
