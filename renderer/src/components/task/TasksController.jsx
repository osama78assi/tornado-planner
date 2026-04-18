import { v4 as generateId } from "uuid";

/**
 * TasksController component - Controls task operations like adding new tasks
 * @param {Object} props
 * @param {Array} props.tasks - Current tasks array
 * @param {Function} props.setData - Function to update tasks array
 * @param {Object} props.plan - Current plan object with metadata
 */
function TasksController({ tasks, setData, plan }) {
    // Handle adding a new task
    function handleAddTask() {
        // Create a new task object with __creationId
        const newTask = {
            __creationId: generateId(),
            title: "",
            description: "",
            completed: false,
            columns: {},
        };

        // Initialize all metadata fields from plan
        if (plan?.metadata) {
            Object.keys(plan.metadata).forEach((key) => {
                newTask.columns[key] = "";
            });
        }

        // Add the new task at the start of the array (unshift)
        setData((prevTasks) => [newTask, ...prevTasks]);
    }

    return (
        <div className="flex justify-end py-2">
            <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-(--main-interactive-color-v2) text-(--main-text-color) rounded hover:bg-(--main-interactive-color-v3) transition-colors"
            >
                Add Task
            </button>
        </div>
    );
}

export default TasksController;
