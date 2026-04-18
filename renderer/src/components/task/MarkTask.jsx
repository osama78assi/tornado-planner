import Checkbox from "../ui/Checkbox";

/**
 * MarkTask component - Renders checkbox for marking task as complete
 * @param {Object} props
 * @param {Object} props.row - Task row data
 * @param {Function} props.onChange - Callback when checkbox state changes
 */
function MarkTask({ row, onChange }) {
    return (
        <div className="flex items-center justify-center">
            <Checkbox value={row?.completed} onChange={onChange} />
        </div>
    );
}

export default MarkTask;
