import { useEffect, useState, useRef } from "react";
import { takeFieldByKey } from "../../util/main";
import { v4 as generateId } from "uuid";
import { compareValues, applyColumnFilter } from "../../util/tableUtils";
import TableHeader from "./TableHeader";
import TableCell from "./TableCell";
import TaskRow from "./TaskRow";
import FormTaskRow from "./FormTaskRow";

/**
 * @typedef Column
 * @property {string[]}                         dataIndex       - The path to your data [level1, level2, the key you want]
 * @property {string}                           header          - The display header name
 * @property {Function}                         render          - Function that returns renderable data by React like JSX, HTML and so on
 * @property {string}                           width           - Fixed width for the column (e.g., "200px")
 * @property {string}                           minWidth        - Minimum width for the column (e.g., "100px")
 * @property {string}                           maxWidth        - Maximum width for the column (e.g., "400px")
 * @property {string}                           type            - Specify the type of the column: "number", "check", "date", "text"
 * @property {string}                           values          - Specify the values in case the schema was check
 * @property {string}                           dateFormat      - Date format key (e.g., "ddmmyyyy_12h") for date type columns
 * @property {boolean}                          sortable        - Whether the column can be sorted
 * @property {Function}                         sorter          - Custom sort function (a, b) => number
 * @property {boolean}                          filterable      - Whether the column can be filtered
 */

/**
 * TasksTable component - Main table component with sorting and filtering
 * @param {Object} props
 * @param {Column[]} props.columns
 * @param {any[]} props.data
 * @param {number} props.planId - ID of the current plan
 * @param {Function} props.setData - Function to update data array
 * @returns
 */
function TasksTable({ columns, data, planId, setData }) {
    // State to track rendered data (for sorting and filtering)
    const [renderedData, setRenderedData] = useState([]);
    // State to track which column is currently sorted
    const [currentSortedColumn, setCurrentSortedColumn] = useState(null);
    // State to track sort states for each column
    const [sortStates, setSortStates] = useState({});
    // Attach a unique stable key to each column
    const [renderColumns, setRenderColumns] = useState(() =>
        columns?.map((obj) => ({ ...obj, __id: generateId() })),
    );
    // Ref for the header row
    const headerRowRef = useRef(null);
    // Ref to store active filters by column header
    const filtersRef = useRef({});

    // Initialize renderedData from data prop
    useEffect(() => {
        setRenderedData(data || []);
    }, [data]);

    // Update columns when prop changes
    useEffect(() => {
        const newColumns = columns?.map((obj) => ({
            ...obj,
            __id: generateId(),
        }));
        setRenderColumns(newColumns);
    }, [columns]);

    // Handle sorting logic
    function handleSort(column, direction) {
        // Update the current sorted column
        setCurrentSortedColumn(column.__id);

        // Update sort states
        setSortStates((prev) => ({
            ...prev,
            [column.__id]: direction,
        }));

        // If direction is 0, reset to original data order
        if (direction === 0) {
            setRenderedData([...data]);
            return;
        }

        // Create a copy of data to sort
        const sortedData = [...data];

        // Sort the data
        sortedData.sort((a, b) => {
            let compareResult;

            // Use custom sorter if provided
            if (column.sorter) {
                compareResult = column.sorter(a, b);
            } else {
                // Use utility function for comparison
                compareResult = compareValues(a, b, column);
            }

            // Apply direction (1 for asc, -1 for desc)
            return compareResult * direction;
        });

        setRenderedData(sortedData);
    }

    // Handle filter apply
    function handleApplyFilter(header, value) {
        // Update filters ref
        filtersRef.current[header] = value;

        // Apply filtering to data
        applyFilters();
    }

    // Handle filter clear
    function handleClearFilter(header) {
        // Remove filter from ref
        delete filtersRef.current[header];

        // Reapply remaining filters
        applyFilters();
    }

    // Handle form submission for create/update
    function handleFormSubmit(newTask, creationId) {
        if (creationId) {
            // Create mode: replace temporary task with real task
            setData((prevTasks) =>
                prevTasks.map((task) =>
                    task.__creationId === creationId ? newTask : task,
                ),
            );
        } else {
            // Update mode: replace existing task and remove __updateId
            setData((prevTasks) =>
                prevTasks.map((task) =>
                    task.id === newTask.id ? newTask : task,
                ),
            );
            // Also update renderedData to remove __updateId
            setRenderedData((prevData) =>
                prevData.map((task) =>
                    task.id === newTask.id ? newTask : task,
                ),
            );
        }
    }

    // Handle cancel action
    function handleCancel(row) {
        if (row.__creationId) {
            // Create mode: remove temporary task
            setData((prevTasks) =>
                prevTasks.filter(
                    (task) => task.__creationId !== row.__creationId,
                ),
            );
        } else if (row.__updateId) {
            // Update mode: remove __updateId to exit edit mode
            setRenderedData((prevData) =>
                prevData.map((task) => {
                    if (task.__updateId === row.__updateId) {
                        const { __updateId, ...taskWithoutUpdateId } = task;
                        return taskWithoutUpdateId;
                    }
                    return task;
                }),
            );
        }
    }

    // Handle marking task as complete
    function handleMarkComplete(row, completed) {
        // Future implementation: update task completion status
        console.log("Mark complete:", row, completed);
    }

    // Apply all active filters to the data
    function applyFilters() {
        // Start with original data
        let filteredData = [...data];

        // Get all active filters
        const activeFilters = Object.entries(filtersRef.current);

        // If no filters, just set the data
        if (activeFilters.length === 0) {
            setRenderedData(filteredData);
            return;
        }

        // Apply each filter
        filteredData = filteredData.filter((row) => {
            // Row must pass all filters
            return activeFilters.every(([header, filterValue]) => {
                // Find the column configuration for this header
                const column = renderColumns.find(
                    (col) => col.header === header,
                );
                if (!column) return true;

                // Get the row value for this column
                const rowValue = takeFieldByKey(row, column.dataIndex);

                // Use utility function to apply filter
                return applyColumnFilter(rowValue, filterValue, column.type);
            });
        });

        setRenderedData(filteredData);
    }

    return (
        <div className="tornado-table-container w-fit overflow-x-auto">
            <table className="tornado-table">
                <colgroup>
                    {renderColumns?.map((col) => (
                        <col
                            key={col.__id}
                            style={{
                                ...(col.width ? { width: col.width } : {}),
                                ...(col.minWidth
                                    ? { minWidth: col.minWidth }
                                    : {}),
                                ...(col.maxWidth
                                    ? { maxWidth: col.maxWidth }
                                    : {}),
                            }}
                        />
                    ))}
                </colgroup>
                <thead className="tornado-table-thead sticky z-1!">
                    <tr ref={headerRowRef}>
                        {renderColumns?.map((col) => (
                            <TableHeader
                                key={col.__id}
                                column={col}
                                sortState={sortStates[col.__id] || 0}
                                currentSortedColumn={currentSortedColumn}
                                onSort={handleSort}
                                onApplyFilter={handleApplyFilter}
                                onClearFilter={handleClearFilter}
                                filtersRef={filtersRef}
                            />
                        ))}
                    </tr>
                </thead>

                <tbody className="tornado-table-tbody">
                    {renderedData?.map?.((row) => {
                        // Check if row is in interactive mode (creation or update)
                        const isInteractive =
                            row.__creationId || row.__updateId;

                        if (isInteractive) {
                            // Render FormTaskRow for interactive mode
                            return (
                                <FormTaskRow
                                    key={`form-task-row-${
                                        row.__creationId || row.__updateId
                                    }`}
                                    row={row}
                                    renderColumns={renderColumns}
                                    onSubmit={handleFormSubmit}
                                    onCancel={() => handleCancel(row)}
                                    planId={planId}
                                />
                            );
                        } else {
                            // Render TaskRow for normal mode
                            return (
                                <TaskRow
                                    key={`task-row-${row.id}`}
                                    row={row}
                                    renderColumns={renderColumns}
                                    onMarkComplete={(completed) =>
                                        handleMarkComplete(row, completed)
                                    }
                                    setRenderedData={setRenderedData}
                                />
                            );
                        }
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default TasksTable;
