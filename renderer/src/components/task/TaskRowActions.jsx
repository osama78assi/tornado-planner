import { IoCheckmark } from "react-icons/io5";
import Button from "../ui/Button";

/**
 * TaskRowActions component - Renders action buttons for task row in edit mode
 * @param {Object} props
 * @param {Object} props.row - Task row data
 * @param {Function} props.onConfirm - Callback when confirm button is clicked
 * @param {Function} props.onCancel - Callback when cancel button is clicked
 */
function TaskRowActions({ row, onConfirm, onCancel }) {
    // Determine if this is create or update mode based on presence of id
    const isCreateMode = !row?.id && row?.__creationId;
    const buttonText = isCreateMode ? "Create" : "Update";

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
                theme="secondary"
                className="w-full!"
            >
                Cancel
            </Button>
        </div>
    );
}

export default TaskRowActions;
