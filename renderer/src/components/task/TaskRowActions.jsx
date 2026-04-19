import { IoCheckmark } from "react-icons/io5";
import { GoTrash } from "react-icons/go";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { deleteTask } from "../../api/task";
import toast from "react-hot-toast";
import { useState } from "react";

/**
 * TaskRowActions component - Renders action buttons for task row in edit mode
 * @param {Object} props
 * @param {Object} props.row - Task row data
 * @param {Function} props.onConfirm - Callback when confirm button is clicked
 * @param {Function} props.onCancel - Callback when cancel button is clicked
 * @param {Function} props.onDelete - Callback when task is deleted
 */
function TaskRowActions({ row, onConfirm, onCancel, onDelete }) {
    // Determine if this is create or update mode based on presence of id
    const isCreateMode = !row?.id && row?.__creationId;
    const buttonText = isCreateMode ? "Create" : "Update";
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    async function handleDelete() {
        try {
            await deleteTask(row.id);
            toast.success("Task deleted successfully");
            setShowDeleteModal(false);
            onDelete?.(row.id);
        } catch (error) {
            toast.error(error.message || "Failed to delete task");
            console.error(error);
        }
    }

    return (
        <div className="flex flex-col items-center justify-center gap-2 w-fit">
            {/* Confirm button with icon */}
            <Button.IconButton
                type="button"
                handleClick={onConfirm}
                size="sm"
                theme="main"
                iconDir="left"
                className="flex justify-between items-center w-full!"
            >
                <IoCheckmark fontSize="14px" />
                {buttonText}
            </Button.IconButton>

            {/* Cancel button without icon */}
            <Button
                type="button"
                handleClick={onCancel}
                size="sm"
                className="bg-gray-500! hover:bg-gray-600! w-full!"
            >
                Cancel
            </Button>

            {/* Delete button - only show in update mode */}
            {!isCreateMode && (
                <Button.IconButton
                    type="button"
                    handleClick={() => setShowDeleteModal(true)}
                    size="sm"
                    iconDir="left"
                    className="bg-red-500! hover:bg-red-600! flex justify-between items-center w-full!"
                >
                    <GoTrash fontSize="14px" />
                    Delete
                </Button.IconButton>
            )}

            {/* Delete confirmation modal */}
            <Modal
                isOpen={showDeleteModal}
                title="Delete Task"
                handleClose={() => setShowDeleteModal(false)}
                className="bg-(--secondary-color)!"
            >
                <div className="flex flex-col gap-4">
                    <p>Are you sure you want to delete this task?</p>
                    <div className="flex justify-evenly">
                        <Button
                            handleClick={() => setShowDeleteModal(false)}
                            size="md"
                            className="bg-gray-500! hover:bg-gray-600!"
                        >
                            Cancel
                        </Button>
                        <Button
                            handleClick={handleDelete}
                            size="md"
                            className="bg-red-500! hover:bg-red-600!"
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default TaskRowActions;
