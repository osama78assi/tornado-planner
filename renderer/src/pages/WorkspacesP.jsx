import { createWorkspace, getWorkspaces } from "../api/workspace";
import WorkspaceItem from "../components/workspace/WorkspaceItem";
import Button from "../components/ui/Button";
import Header from "../components/ui/Header";
import useData from "../hooks/useData";
import { useState } from "react";
import Modal from "../components/ui/Modal";
import WorkspaceForm from "../components/workspace/WorkspaceForm";
import toast from "react-hot-toast";
import Tag from "../components/ui/Tag";
import Workspaces from "../components/workspace/Workspaces";
import { getDayStatus, getSettingsSync } from "../util/main";
import { getConstantsSnyc } from "../util/constants";

function WorkspacesP() {
    const { data, setData, loading } = useData({
        fetchFunction: getWorkspaces,
    });
    const [isOpen, setIsOpen] = useState(false);

    async function handleCreateWorkspace(data) {
        try {
            const newWorkspace = await createWorkspace(data);

            setData((d) => [newWorkspace, ...d]);

            toast.success("New workspace created successfully");

            setIsOpen(false);
        } catch (err) {
            toast.error(err.message || "Something went wrong");
            console.log(err);
        }
    }

    return (
        <div className="px-2 py-3">
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

            <Header title="Workspaces">
                <Button.IconButton
                    icon="MdOutlineLibraryAdd"
                    size="sm"
                    style={{ padding: "0.4rem" }}
                    iconDir="left"
                    iconProps={{ style: { fontSize: "1.3rem" } }}
                    handleClick={() => {
                        setIsOpen(true);
                    }}
                >
                    New Workspace
                </Button.IconButton>
            </Header>

            <Workspaces data={data} setData={setData} loading={loading} />

            {/* Render the modal to add a new workspace */}
            <Modal
                isOpen={isOpen}
                title={
                    <h2 className="text-xl text-(--main-interactive-color-v1)">
                        Add new workspace
                    </h2>
                }
                handleClose={() => setIsOpen(false)}
                className={"bg-(--main-color)! sm:w-175!"}
            >
                <div className=" w-full">
                    <WorkspaceForm onSubmit={handleCreateWorkspace} />
                </div>
            </Modal>
        </div>
    );
}

export default WorkspacesP;
