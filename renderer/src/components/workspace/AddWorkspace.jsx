import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import toast from "react-hot-toast";
import { createWorkspace } from "../../api/workspace";
import WorkspaceForm from "./WorkspaceForm";

function AddWorkspace({ setData }) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Pass it to the parent so it can be called from up there
        openFn = setIsOpen;
        console.log("Set ?");
    }, []);

    async function handleCreateWorkspace(data) {
        try {
            const newWorkspace = await createWorkspace(data);

            setData?.((d) => [newWorkspace, ...d]);

            toast.success("New workspace created successfully");

            setIsOpen(false);
        } catch (err) {
            toast.error(err.message || "Something went wrong");
            console.log(err);
        }
    }

    return (
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
    );
}

export default AddWorkspace;
