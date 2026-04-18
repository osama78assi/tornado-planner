import TableCell from "./TableCell";
import MarkTask from "./MarkTask";
import { v4 } from "uuid";

/**
 * TaskRow component - Renders a read-only task row
 * @param {Object} props
 * @param {Object} props.row - Task row data
 * @param {Array} props.renderColumns - Array of column configurations
 * @param {Function} props.onMarkComplete - Callback when task is marked complete
 * @param {Function} props.setRenderedData - Function to update rendered data for edit mode
 */
function TaskRow({ row, renderColumns, onMarkComplete, setRenderedData }) {
    const handleDoubleClick = () => {
        // Add __updateId to enable update mode
        setRenderedData?.((prevData) =>
            prevData.map((task) =>
                task.id === row.id ? { ...task, __updateId: v4() } : task,
            ),
        );
    };

    return (
        <tr
            key={`task-row-${row.id}`}
            className="tornado-table-tr"
            onDoubleClick={handleDoubleClick}
        >
            {renderColumns?.map((col, index) => {
                // First column should render MarkTask component
                if (index === 0 && col.dataIndex?.[0] === "completed") {
                    return (
                        <td
                            key={`task-row-${col.__id}`}
                            className="tornado-table-td"
                        >
                            <MarkTask row={row} onChange={onMarkComplete} />
                        </td>
                    );
                }

                // Render other columns normally
                return (
                    <TableCell
                        key={`task-row-${col.__id}`}
                        column={col}
                        row={row}
                    />
                );
            })}
        </tr>
    );
}

export default TaskRow;
