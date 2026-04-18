import { useEffect, useState } from "react";
import { FaArrowUpShortWide, FaArrowDownShortWide } from "react-icons/fa6";
import ColumnFilter from "./filters/ColumnFilter";

// Constants for icon widths
const SORT_ICON_WIDTH = 20; // Width in pixels for sort icons

/**
 * TableHeader component - Renders sortable table header cell
 * @param {Object} props
 * @param {Column} props.column - Column configuration
 * @param {number} props.sortState - Current sort state: -1 (desc), 0 (default), 1 (asc)
 * @param {string} props.currentSortedColumn - ID of currently sorted column
 * @param {Function} props.onSort - Callback when sort is triggered
 * @param {Function} props.onApplyFilter - Callback when filter is applied
 * @param {Function} props.onClearFilter - Callback when filter is cleared
 * @param {Object} props.filtersRef - Ref object containing active filters
 */
function TableHeader({
    column,
    sortState,
    currentSortedColumn,
    onSort,
    onApplyFilter,
    onClearFilter,
    filtersRef,
}) {
    // Track the internal sort direction for this column
    const [direction, setDirection] = useState(0);

    // Update direction when sortState changes from parent
    useEffect(() => {
        setDirection(sortState);
    }, [sortState]);

    // Handle sort click
    function handleSortClick() {
        // If column is not sortable, ignore the logic
        if (!column.sortable) return;

        let newDirection;
        // Check if this is the currently sorted column
        if (currentSortedColumn === column.__id) {
            // Continue the pattern: 1 -> -1 -> 0
            if (direction === 1) {
                newDirection = -1;
            } else if (direction === -1) {
                newDirection = 0;
            } else {
                newDirection = 1;
            }
        } else {
            // Different column, start from 1 (asc)
            newDirection = 1;
        }

        setDirection(newDirection);
        onSort(column, newDirection);
    }

    // Render sort indicator based on direction
    function renderSortIndicator() {
        if (
            !column.sortable ||
            (currentSortedColumn !== column.__id &&
                currentSortedColumn !== null) ||
            direction === 0
        )
            return (
                <div
                    style={{
                        width: `${SORT_ICON_WIDTH}px`,
                        height: `${SORT_ICON_WIDTH}px`,
                    }}
                />
            );

        if (direction === 1) {
            return (
                <FaArrowUpShortWide
                    className="text-(--main-interactive-color-v1)"
                    style={{
                        width: `${SORT_ICON_WIDTH}px`,
                        height: `${SORT_ICON_WIDTH}px`,
                    }}
                />
            );
        } else if (direction === -1) {
            return (
                <FaArrowDownShortWide
                    className="text-(--main-interactive-color-v1)"
                    style={{
                        width: `${SORT_ICON_WIDTH}px`,
                        height: `${SORT_ICON_WIDTH}px`,
                    }}
                />
            );
        }
    }

    // Check if filter is active for this column
    const isFilterActive = filtersRef?.current?.[column.header] !== undefined;

    return (
        <th className="tornado-table-th" data-column-id={column.__id}>
            <div
                className={`flex items-center gap-1 ${column.sortable ? "cursor-pointer" : ""}`}
                onClick={handleSortClick}
            >
                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                    {typeof column.header === "function"
                        ? column.header(column)
                        : column.header}
                </span>
                {renderSortIndicator()}
                {column.filterable && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <ColumnFilter
                            column={column}
                            onApplyFilter={onApplyFilter}
                            onClear={onClearFilter}
                            isActive={isFilterActive}
                        />
                    </div>
                )}
            </div>
        </th>
    );
}

export default TableHeader;
