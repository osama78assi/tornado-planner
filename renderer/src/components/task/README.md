# TaskTable Component Structure

This document describes the refactored TaskTable component structure with inline editing capabilities.

## File Organization

### Main Components

- **TaskTable.jsx** - Main table component that orchestrates sorting, filtering, and row rendering
- **TasksController.jsx** - Controller component with "Add Task" button for creating new tasks

### Row Components

- **TaskRow.jsx** - Read-only task row component (display mode)
- **FormTaskRow.jsx** - Editable task row component (create/edit mode)
- **MarkTask.jsx** - Checkbox component for marking tasks as complete
- **TaskRowActions.jsx** - Action buttons (Create/Update and Cancel) for edit mode

### Display Components

- **TableHeader.jsx** - Renders table header cells with sort and filter controls
- **TableCell.jsx** - Renders table data cells with proper formatting

### Filter Components (in `filters/` directory)

- **ColumnFilter.jsx** - Main filter dropdown component
- **TextFilterOverlay.jsx** - Text input filter overlay
- **NumberFilterOverlay.jsx** - Number input filter overlay
- **DateFilterOverlay.jsx** - Date picker filter overlay
- **CheckFilterOverlay.jsx** - Checkbox multi-select filter overlay

### Utilities

- **../../util/tableUtils.js** - Utility functions for table operations
    - `compareValues(a, b, column)` - Compare values for sorting
    - `filterTextValue(rowValue, filterValue)` - Filter text columns
    - `filterNumberValue(rowValue, filterValue)` - Filter number columns
    - `filterDateValue(rowValue, filterValue)` - Filter date columns
    - `filterCheckValue(rowValue, filterValue)` - Filter check columns
    - `applyColumnFilter(rowValue, filterValue, columnType)` - Apply filter based on type
- **../../util/main.js** - General utility functions
    - `takeFieldByKey(data, fields)` - Access nested object properties by path

## Component Hierarchy

```
PlanP (Page)
├── TasksController
│   └── Button ("Add Task")
└── TaskTable
    ├── TableHeader (for each column)
    │   └── ColumnFilter (if filterable)
    │       ├── TextFilterOverlay
    │       ├── NumberFilterOverlay
    │       ├── DateFilterOverlay
    │       └── CheckFilterOverlay
    └── For each row:
        ├── TaskRow (display mode)
        │   ├── MarkTask (first column)
        │   └── TableCell (other columns)
        └── FormTaskRow (edit/create mode)
            ├── TaskRowActions (first column)
            │   ├── Button.IconButton (Create/Update)
            │   └── Button (Cancel)
            └── Input/Dropdown (other columns)
```

## Inline Editing Workflow

### Creating a New Task

1. User clicks "Add Task" button in **TasksController**
2. TasksController adds a temporary task with `__creationId` to the tasks array
3. **TaskTable** detects the temporary task and renders **FormTaskRow** instead of **TaskRow**
4. User fills in the form inputs and either:
    - Clicks the "Create" button in **TaskRowActions**, or
    - Presses Enter key (handled by `onKeyDown` on the row)
5. **FormTaskRow** validates the data (title is required)
6. **FormTaskRow** calls `createTask()` API with full payload
7. On success, the temporary task is replaced with the real task from the API
8. User can click "Cancel" to remove the temporary task

### Editing an Existing Task

1. User double-clicks a **TaskRow**
2. **TaskTable** sets the row to edit mode
3. **TaskTable** renders **FormTaskRow** instead of **TaskRow**
4. **FormTaskRow** initializes form refs with current task data using `takeFieldByKey()`
5. User modifies the inputs and either:
    - Clicks the "Update" button in **TaskRowActions**, or
    - Presses Enter key
6. **FormTaskRow** compares current values with initial values
7. Only changed fields are sent to `updateTask()` API
8. On success, the task is updated in the tasks array
9. User can click "Cancel" to exit edit mode without saving

### Marking Tasks Complete

1. User clicks the checkbox in **MarkTask** component
2. **MarkTask** calls `updateTask()` API with `{ completed: true/false }`
3. On success, the task's completed status is updated
4. Toast notification confirms the action

## Data Flow

### Props Flow

```
PlanP
├── planId → TasksController
├── planId → TaskTable
├── tasks (state) → TaskTable
└── setTasks → TasksController & TaskTable

TaskTable
├── renderColumns → TaskRow & FormTaskRow
├── row data → TaskRow & FormTaskRow
├── onSubmit handler → FormTaskRow
└── onCancel handler → FormTaskRow

FormTaskRow
├── Uses refs to track form values (avoids re-renders)
├── Uses takeFieldByKey() to read nested data
└── Builds nested payload manually for API calls
```

### Key Design Decisions

1. **Refs over State** - FormTaskRow uses refs to track input values, avoiding constant parent re-renders
2. **Partial Updates** - Only changed fields are sent to the API on update
3. **Temporary IDs** - New tasks use `__creationId` (UUID) until created on the server
4. **Column Headers as Keys** - Form refs use column headers as keys for simplicity
5. **No Form Element** - Uses `onKeyDown` on `<tr>` instead of `<form>` to avoid form submission issues
6. **Utility Functions** - `takeFieldByKey()` reads nested data; manual building for writes

## Benefits of This Structure

1. **Separation of Concerns** - Each component has a single responsibility
2. **Reusability** - Filter overlays and utilities can be reused elsewhere
3. **Maintainability** - Easier to locate and modify specific functionality
4. **Testability** - Individual components and utilities can be tested in isolation
5. **Scalability** - Easy to add new filter types or table features
6. **Performance** - Refs prevent unnecessary re-renders during form input
7. **User Experience** - Inline editing provides seamless task management

## Usage

```jsx
import TasksController from './components/task/TasksController';
import TasksTable from './components/task/TaskTable';

// In PlanP.jsx
<TasksController
  planId={planId}
  setData={setTasks}
/>

<TasksTable
  columns={headers}
  data={tasks}
  planId={planId}
  setData={setTasks}
/>
```
