import { useNavigate } from "react-router-dom";
import { formatDate } from "../../util/main";
import Icon from "../ui/Icon";
import { FaEdit } from "react-icons/fa";
import { IoTrashOutline } from "react-icons/io5";
import { useRef, useState } from "react";
import WorkspaceForm from "./WorkspaceForm";
import Modal from "../ui/Modal";
import { updateWorkspace } from "../../api/workspace";
import toast from "react-hot-toast";

function WorkspaceItem({ updateData, workspace }) {
    const [isOpen, setIsOpen] = useState(false);
    const nav = useNavigate();
    // /workspaces/:workpaceId/plans

    function handleClick() {
        nav(`/workspaces/${workspace.id}/plans`);
    }

    async function handleUpdateWorkspace(payload) {
        try {
            const updatedWorkspace = await updateWorkspace(
                workspace.id,
                payload,
            );

            updateData((data) =>
                data.map((curWorkspace) =>
                    curWorkspace.id === workspace.id
                        ? updatedWorkspace
                        : curWorkspace,
                ),
            );

            toast.success("Workspace updated successfully");

            setIsOpen(false);
        } catch (err) {
            toast.error(err.message || "Something went wrong");
            console.log(err);
        }
    }

    return (
        <>
            <div
                className={`flex flex-wrap border border-(--main-divider-color) p-3 rounded-xl cursor-pointer transition-[border-color] hover:border-(--main-interactive-color-v3)`}
                onClick={() => {
                    handleClick();
                }}
            >
                <div className="flex basis-full pe-3 justify-between">
                    <div className="flex basis-full items-center gap-3 py-3 text-(--main-interactive-color-v1)">
                        <Icon
                            id={workspace?.icon || "IoLayers"}
                            className="text-xl"
                        />
                        <h2 className="text-xl">{workspace.name}</h2>
                    </div>

                    <button
                        className="h-fit p-1 cursor-pointer"
                        onClick={(e) => {
                            setIsOpen(true);
                            // Don't get invoked when the user click on the edit button
                            e.stopPropagation();
                        }}
                    >
                        <FaEdit className="text-lg transition-colors hover:text-(--main-interactive-color-v1)" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <p>{workspace.description}</p>
                    <p className="self-start text-gray-500">
                        {formatDate(workspace.updatedAt)}
                    </p>
                </div>
            </div>

            <Modal
                isOpen={isOpen}
                title={
                    <h2 className="text-xl text-(--main-interactive-color-v1)">
                        Update Workspace
                    </h2>
                }
                handleClose={() => setIsOpen(false)}
                className={"bg-(--main-color)! sm:w-175!"}
            >
                <div className=" w-full">
                    <WorkspaceForm
                        initialValues={{
                            name: workspace.name,
                            description: workspace.description,
                            icon: workspace.icon,
                        }}
                        onSubmit={handleUpdateWorkspace}
                        update={true}
                    />
                </div>
            </Modal>
        </>
    );
}

export default WorkspaceItem;
