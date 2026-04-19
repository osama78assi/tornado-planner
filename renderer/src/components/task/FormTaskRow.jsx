import { useRef, useEffect, useState } from "react";
import Input from "../ui/Input";
import Dropdown from "../ui/Dropdown";
import TaskRowActions from "./TaskRowActions";
import { createTask, updateTask } from "../../api/task";
import toast from "react-hot-toast";
import {
    takeFieldByKey,
    formateDateBy,
    synchronizeDateRange,
} from "../../util/main";
import { getConstantsSnyc } from "../../util/constants";
import { synchronizeTaskStatus } from "../../util/tableUtils";

/**
 * InputRenderer component - Renders appropriate input based on column type
 * @param {Object} props
 * @param {Object} props.col - Column configuration
 * @param {any} props.initialValue - Initial value for the input
 * @param {Function} props.onChange - Callback when value changes (key, value)
 * @param {boolean} props.creationMode - To check what is the mode
 */
function InputRenderer({ col, initialValue, onChange, creationMode }) {
    const inputRef = useRef(null);

    function handleChange(newValue) {
        onChange?.(col.header, newValue);
    }

    // Auto-focus on title input on initial render
    // This improves UX by allowing users to immediately start typing when creating/editing a task
    useEffect(() => {
        if (col.header === "title" && inputRef.current && creationMode) {
            inputRef.current.focus();
        }
    }, []);

    switch (col.type) {
        case "text":
            return (
                <Input.TextArea
                    ref={inputRef}
                    defaultValue={initialValue}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={col.header}
                    className="bg-transparent resize-none"
                />
            );

        case "number":
            return (
                <Input
                    type="number"
                    defaultValue={initialValue}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={col.header}
                    className="bg-transparent"
                />
            );

        case "date":
            return (
                <DateTimeInput
                    initialValue={initialValue}
                    onChange={handleChange}
                    col={col}
                />
            );

        case "check":
            // Map values to dropdown options
            const options = col.values?.map((val) => ({
                label: val,
                value: val,
                active: val === initialValue,
            }));

            return (
                <Dropdown
                    label={initialValue || "Select..."}
                    options={options}
                    onSelect={({ option, forceClose }) => {
                        handleChange(option.value);
                        forceClose();
                    }}
                    optionOptions={{ className: "p-1" }}
                    className="bg-transparent!"
                />
            );

        default:
            return (
                <Input
                    defaultValue={initialValue}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder={col.header}
                    className="bg-transparent"
                />
            );
    }
}

/**
 * DateTimeInput component - Renders a datetime input with hidden native picker
 * @param {Object} props
 * @param {string} props.initialValue - Initial datetime value
 * @param {Function} props.onChange - Callback when value changes
 * @param {Object} props.col - Column configuration for date formatting
 */
function DateTimeInput({ initialValue, onChange, col }) {
    const inputRef = useRef(null);
    const displayRef = useRef(null);
    const [selectedValue, setSelectedValue] = useState(initialValue || "");

    function handleChange(e) {
        const newValue = e.target.value;
        setSelectedValue(newValue);
        onChange?.(newValue);
    }

    function handleClick() {
        inputRef.current?.showPicker?.();
    }

    function handleFocus() {
        if (displayRef.current) {
            displayRef.current.classList.add(
                "shadow-[0_0_10px_var(--main-interactive-color-v3)]",
            );
        }
    }

    function handleBlur() {
        if (displayRef.current) {
            displayRef.current.classList.remove(
                "shadow-[0_0_10px_var(--main-interactive-color-v3)]",
            );
        }
    }

    // Format display value
    let displayValue = selectedValue;
    if (selectedValue && col?.dateFormat) {
        try {
            const constants = getConstantsSnyc();
            const dateFormatConfig = constants.DATE_FORMATS[col.dateFormat];
            displayValue = formateDateBy(selectedValue, dateFormatConfig);
        } catch (err) {
            console.error("Error formatting date:", err);
        }
    }

    return (
        <div className="relative  h-full!">
            <input
                ref={inputRef}
                type="datetime-local"
                value={selectedValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-0 opacity-0 absolute"
            />
            <div
                ref={displayRef}
                onClick={handleClick}
                className="bg-transparent h-full! flex rounded-sm p-1 gap-2 border-0 transition-all cursor-pointer hover:shadow-[0_0_10px_var(--main-interactive-color-v3)] text-l w-full"
            >
                {displayValue || "Select date..."}
            </div>
        </div>
    );
}

/**
 * FormTaskRow component - Renders an editable task row with form inputs
 * @param {Object} props
 * @param {Object} props.row - Task row data
 * @param {Array} props.renderColumns - Array of column configurations
 * @param {Function} props.onSubmit - Callback when form is submitted successfully
 * @param {Function} props.onCancel - Callback when cancel is clicked
 * @param {Function} props.onDelete - Callback when task is deleted
 * @param {number} props.planId - ID of the current plan
 */
function FormTaskRow({
    row,
    renderColumns,
    onSubmit,
    onCancel,
    onDelete,
    planId,
}) {
    // Create refs for each column to track form values (using header as key)
    const formRefs = useRef({});
    // Track initial values to detect changes for update mode
    const initialValues = useRef({});
    // Force rerender when initial values are extracted
    const [renderKey, setRenderKey] = useState(0);

    // Initialize refs with row data
    // { header: value }
    useEffect(() => {
        renderColumns?.forEach((col) => {
            // Skip the first column (actions/checkbox)
            if (col.dataIndex?.[0] === "completed") return;

            // Get initial value from row data using utility function
            const initialValue = takeFieldByKey(row, col.dataIndex);

            // Use column header
            const key = col.header;

            // Store initial value
            initialValues.current[key] = initialValue;

            // Initialize ref if not exists
            if (!formRefs.current[key]) {
                formRefs.current[key] = { value: initialValue };
            }
        });

        // Force rerender after initial values are extracted
        setRenderKey((prev) => prev + 1);
    }, [row, renderColumns]);

    // Handle form submission
    async function handleSubmit(e) {
        e?.preventDefault();

        try {
            // Validate required fields (title is required)
            const titleValue = formRefs.current["title"]?.value;

            if (!titleValue || titleValue.trim() === "") {
                toast.error("title is required");
                return;
            }

            // Determine if this is create or update mode
            const isCreateMode = !row?.id && row?.__creationId;

            if (isCreateMode) {
                // Create mode: collect all form data
                const payload = { planId };

                renderColumns.forEach((col) => {
                    if (col.dataIndex?.[0] === "completed") return;

                    // Get key and value
                    const key = col.header;
                    const value = formRefs.current[key]?.value;

                    // Skip adding the value entirly (remember EAV store them so ignore save memory)
                    if (value === "") return;

                    // Build nested payload structure manually
                    if (["title", "description"].includes(key)) {
                        // From task default data
                        payload[key] = value;
                    } else {
                        // Add to metadata
                        if (payload.metadata) {
                            payload.metadata[key] = value;
                        } else {
                            payload.metadata = { [key]: value };
                        }
                    }
                });

                // Synchronize completed and status before creating
                synchronizeTaskStatus(payload);

                // Validate date range consistency
                synchronizeDateRange(payload, row);

                // Call create API
                const newTask = await createTask(payload);
                toast.success("Task created successfully");

                // Replace temporary task with real task from API
                onSubmit?.(newTask, row.__creationId);
            } else {
                // Update mode: collect only changed fields
                const payload = {};
                let hasChanges = false;

                renderColumns.forEach((col) => {
                    if (col.dataIndex?.[0] === "completed") return;

                    // Get key and values
                    const key = col.header;
                    const currentValue = formRefs.current[key]?.value;
                    const initialValue = initialValues.current[key];

                    // Skip adding the value entirely (remember EAV store them so ignore save memory)
                    if (currentValue === "") return;

                    // Check if value has changed
                    if (currentValue !== initialValue) {
                        hasChanges = true;

                        // Build nested payload structure manually
                        if (["title", "description"].includes(key)) {
                            // From task default data
                            payload[key] = currentValue;
                        } else {
                            // Add to metadata
                            if (payload.metadata) {
                                payload.metadata[key] = currentValue;
                            } else {
                                payload.metadata = { [key]: currentValue };
                            }
                        }
                    }
                });

                if (!hasChanges) {
                    onCancel?.();
                    return;
                }

                // Synchronize completed and status before updating
                synchronizeTaskStatus(payload);

                // Validate date range consistency
                synchronizeDateRange(payload, row);

                // Call update API with only changed fields
                const updatedTask = await updateTask(row.id, payload);

                toast.success("Task updated successfully");

                // Update task in parent array
                onSubmit?.(updatedTask);
            }
        } catch (error) {
            // Display error message and terminate
            toast.error(error.message || "Failed to save task");
            console.error(error);
            return;
        }
    }

    // Handle input change
    function handleInputChange(key, value) {
        console.log(row.__creationId);

        formRefs.current[key] = { value };
        console.log(formRefs.current);
    }

    // Handle Enter key press
    function handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    return (
        <tr className="tornado-table-tr" onKeyDown={handleKeyDown}>
            {renderColumns?.map((col, index) => {
                // First column should render TaskRowActions
                if (index === 0 && col.dataIndex?.[0] === "completed") {
                    return (
                        <td
                            key={`form-task-row-${col.__id}`}
                            className="tornado-table-td"
                        >
                            <TaskRowActions
                                row={row}
                                onConfirm={handleSubmit}
                                onCancel={onCancel}
                                onDelete={onDelete}
                            />
                        </td>
                    );
                }

                // Render input for other columns
                return (
                    <td
                        key={`form-task-row-${col.__id}`}
                        className="tornado-table-td tornado-table-td_form"
                    >
                        <InputRenderer
                            key={`${col.__id}-${renderKey}`}
                            col={col}
                            initialValue={
                                formRefs.current[col.header]?.value || ""
                            }
                            onChange={handleInputChange}
                            creationMode={row?.__creationId ? true : false}
                        />
                    </td>
                );
            })}
        </tr>
    );
}

export default FormTaskRow;
