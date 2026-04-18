# Task Metadata System Documentation

## Overview

The Task Metadata System is a flexible, schema-based approach to managing task attributes in the Tornado Planner application. It allows tasks to have dynamic metadata fields that are validated against their parent plan's schema.

## Architecture

### Key Components

1. **Task Model** (`main/models/task.js`)
    - Core task fields: `id`, `title`, `description`, `icon`, `planId`, `completed`
    - Belongs to a Plan through `planId` foreign key
    - Has many-to-many relationship with Attributes through Values

2. **Attribute Model** (`main/models/attribute.js`)
    - Represents metadata column definitions (e.g., "start date", "priority")
    - Stores the `key` (column name) for each metadata field

3. **Value Model** (`main/models/value.js`)
    - Junction table storing actual metadata values for tasks
    - Links: `taskId` → `attributeId` → `value`

4. **Plan Model** (`main/models/plan.js`)
    - Defines the metadata schema that all its tasks must follow
    - Schema stored in `metadata` field as JSON

### Data Flow

```
Plan (defines schema)
  ↓
Task (inherits schema from plan)
  ↓
Metadata (key-value pairs validated against plan schema)
  ↓
Attribute (column definitions) ← Value (actual data) → Task
```

## Default Metadata Schema

Every plan automatically includes these required metadata fields:

```javascript
{
    "start date": {
        "type": "date",
        "format": "ddmmyyyy_12h"  // or user's preferred format
    },
    "end date": {
        "type": "date",
        "format": "ddmmyyyy_12h"
    },
    "status": {
        "type": "check",
        "values": [
            "done",
            "in progress",
            "not started",
            "discarded"
        ]
    },
    "priority": {
        "type": "check",
        "values": [
            "low",
            "medium",
            "high"
        ]
    }
}
```

**Source:** `main/config/constant.js` - `getDefaultMetadata()` and `DEFAULT_SCHEMA()`

## Metadata Types

### 1. Date Type

```javascript
{
    "type": "date",
    "format": "ddmmyyyy_12h"  // optional, defaults to user settings
}
```

**Valid formats:**

- `ddmmyyyy_12h` - DD/MM/YYYY with 12-hour time
- `ddmmyyyy_24h` - DD/MM/YYYY with 24-hour time
- `ddmmyyyy` - DD/MM/YYYY without time
- `mmddyyyy_12h` - MM/DD/YYYY with 12-hour time
- `mmddyyyy_24h` - MM/DD/YYYY with 24-hour time
- `mmddyyyy` - MM/DD/YYYY without time

**Validation:** Accepts `Date` instances or parseable date strings

### 2. Check Type (Dropdown/Select)

```javascript
{
    "type": "check",
    "values": ["option1", "option2", "option3"]
}
```

**Constraints:**

- Must have 1-20 values
- Values are trimmed and deduplicated automatically
- Accepts `null` or any value in the `values` array

### 3. String Type

```javascript
{
    "type": "string"
}
```

**Validation:** Accepts any string or value that can be converted to string

### 4. Number Type

```javascript
{
    "type": "number"
}
```

**Validation:** Accepts any value that can be parsed as a number

## Schema Validation Rules

### Key Validation

- Must be a string
- Length: 1-60 characters
- Automatically trimmed
- Duplicate keys are merged
- Must not be `title` nor `description` as they are allocated already (the rest no need remove duplication will handle it from there)

### Schema Structure

Each metadata field must have:

- **Required:** `type` (one of: "date", "string", "number", "check")
- **Optional:**
    - `values` (only for "check" type, array of 1-20 items)
    - `format` (only for "date" type)
- **No extra attributes allowed**

### Validation Functions

- `isValidSchemaKey()` - Validates metadata key names
- `isValidSchema()` - Validates schema structure
- `isValidValue()` - Validates values against schema type
- `sanitizeMetadata()` - Cleans and normalizes metadata

**Source:** `main/config/constant.js`

## Task Creation

### API Flow

**Frontend** → **Preload** → **Handler** → **Service** → **Database**

### 1. Frontend API (`renderer/src/api/task.js`)

```javascript
import { createTask } from "./api/task.js";

const newTask = await createTask({
    title: "Complete documentation",
    description: "Write comprehensive docs for metadata system",
    planId: 1,
    completed: false,
    icon: "MdTask",
    metadata: {
        "start date": new Date(),
        "end date": "2024-12-31",
        status: "in progress",
        priority: "high",
    },
});
```

### 2. Preload Bridge (`preload/preload.js`)

```javascript
contextBridge.exposeInMainWorld("tasks", {
    create: (payload) => ipcRenderer.invoke(channels.tasks.create, payload),
    // ...
});
```

### 3. Handler (`main/handlers/task.js`)

```javascript
async create(payload) {
    try {
        const results = await taskServices.create(payload);
        return {
            success: true,
            data: results.toJSON(),
        };
    } catch (err) {
        return errorHandler(err);
    }
}
```

### 4. Service (`main/services/task.js`)

The service performs these steps:

1. **Validate Plan Exists**

    ```javascript
    if (!details.planId) throw TASK_WITH_NO_PLAN;
    const plan = await Plan.findByPk(details.planId, {
        include: [{ model: Attribute, as: "attrs" }],
    });
    if (!plan) throw MISSING_PLAN;
    ```

2. **Sanitize and Validate Metadata**

    ```javascript
    const valuesToCreate = await this._sanitize(
        plan,
        details.metadata,
        async () => {
            task = await Task.create(details, { transaction });
            return task.id;
        },
    );
    ```

3. **Create Task and Values**

    ```javascript
    await metadataServices.upsertValues(valuesToCreate, transaction);
    ```

4. **Return Reshaped Task**
    ```javascript
    const finalTask = await this.getById(task.id, transaction);
    return finalTask;
    ```

### Metadata Sanitization Process (`_sanitize()`)

1. Creates lookup map of plan's attributes
2. Validates each metadata key exists in plan schema
3. Validates each value matches its type
4. Returns array of Value objects ready for insertion

**Errors thrown:**

- `UNRECOGNIZED_ATTRIBUTE` - Metadata key not in plan schema
- `VALUE_NOT_MATCH_TYPE` - Value doesn't match expected type

## Task Update

### Frontend API

```javascript
import { updateTask } from "./api/task.js";

const updatedTask = await updateTask(taskId, {
    title: "Updated title",
    completed: true,
    metadata: {
        status: "done",
        "end date": new Date(),
    },
});
```

### Update Flow

1. If `payload.metadata` exists:
    - Fetch task with plan and attributes
    - Validate metadata against plan schema
    - Upsert values (update existing, insert new)

2. Update task fields with `Task.update()`

3. Return reshaped task with merged metadata

**Note:** Partial updates are supported - you only need to send changed fields

## Task Deletion

### Frontend API

```javascript
import { deleteTask } from "./api/task.js";

await deleteTask(taskId);
// Returns: "Task deleted successfully"
```

### Cascade Deletion

When a task is deleted:

1. All associated Value records are automatically deleted (CASCADE)
2. Attribute records remain (they may be used by other tasks)

## Examples

### Example 1: Task with Default Metadata Only

```javascript
await createTask({
    title: "Simple task",
    description: "A basic task",
    planId: 1,
    completed: false,
    metadata: {
        "start date": "2024-04-18",
        status: "not started",
        priority: "medium",
    },
});
```

### Example 2: Plan with Custom Metadata

First, create a plan with custom schema:

```javascript
await createPlan({
    name: "Development Sprint",
    workspaceId: 1,
    metadata: {
        // Default fields are automatically included
        "estimated hours": {
            type: "number",
        },
        "assigned to": {
            type: "string",
        },
        complexity: {
            type: "check",
            values: ["simple", "moderate", "complex"],
        },
    },
});
```

Then create tasks with custom metadata:

```javascript
await createTask({
    title: "Implement feature X",
    planId: 2,
    metadata: {
        "start date": new Date(),
        status: "in progress",
        priority: "high",
        "estimated hours": 8,
        "assigned to": "John Doe",
        complexity: "complex",
    },
});
```

### Example 3: Updating Task Metadata

```javascript
// Update only specific fields
await updateTask(5, {
    completed: true,
    metadata: {
        status: "done",
        "end date": new Date(),
    },
});
```

### Example 4: Validation Errors

```javascript
// ❌ This will throw UNRECOGNIZED_ATTRIBUTE
await createTask({
    planId: 1,
    title: "Invalid task",
    metadata: {
        "unknown field": "value", // Not in plan schema
    },
});

// ❌ This will throw VALUE_NOT_MATCH_TYPE
await createTask({
    planId: 1,
    title: "Invalid task",
    metadata: {
        priority: "urgent", // Not in allowed values
    },
});

// ❌ This will throw VALUE_NOT_MATCH_TYPE
await createTask({
    planId: 1,
    title: "Invalid task",
    metadata: {
        "start date": "not a valid date",
    },
});
```

## Data Reshaping

Tasks are returned with metadata in a flattened `columns` object:

**Database structure:**

```javascript
{
    id: 1,
    title: "Task",
    metadata: [
        { key: "status", Value: { value: "done" } },
        { key: "priority", Value: { value: "high" } }
    ]
}
```

**Reshaped response:**

```javascript
{
    id: 1,
    title: "Task",
    columns: {
        "status": "done",
        "priority": "high"
    }
}
```

**Reshaping function:** `_reshape()` and `_group()` in `main/services/task.js`

## Error Codes

| Code                          | Description                       | Thrown When                                            |
| ----------------------------- | --------------------------------- | ------------------------------------------------------ |
| `TASK_WITH_NO_PLAN`           | Task must belong to a plan        | `planId` is missing                                    |
| `MISSING_PLAN`                | Plan not found                    | `planId` doesn't exist                                 |
| `UNRECOGNIZED_ATTRIBUTE`      | Unknown metadata field            | Metadata key not in plan schema                        |
| `VALUE_NOT_MATCH_TYPE`        | Invalid value type                | Value doesn't match schema type                        |
| `INVALID_SCHEMA_KEY`          | Invalid column name               | Key length 0 or > 60 chars                             |
| `ALLOCATED_COLUMNS`           | For already allocated column name | currently when column name is 'title' or 'description' |
| `INVALID_SCHEMA_TYPE`         | Invalid type                      | Type not in allowed types                              |
| `INVALID_SCHEMA_VALUES`       | Invalid values array              | Not array, empty, or > 20 items                        |
| `INVALID_DATE_FORMAT`         | Unknown date format               | Format not in DATE_FORMATS                             |
| `INVALID_SCHEMA_VALUES_USAGE` | Values on non-check type          | `values` used with non-check type                      |

**Source:** `main/errors/task.js` and `main/errors/global.js`

## Testing

### Test Examples from `main/__tests__/main.test.mjs`

**Test: Unrecognized attribute**

```javascript
await taskServices.create({
    planId: plan.id,
    title: "task one",
    metadata: {
        "start date": new Date(),
        t: "1", // ❌ Not in schema
    },
});
// Throws: UNRECOGNIZED_ATTRIBUTE
```

**Test: Type mismatch (date)**

```javascript
await taskServices.create({
    planId: plan.id,
    title: "task one",
    metadata: {
        "end date": "sdf", // ❌ Invalid date
    },
});
// Throws: VALUE_NOT_MATCH_TYPE
```

**Test: Type mismatch (check)**

```javascript
await taskServices.create({
    planId: plan.id,
    title: "task one",
    metadata: {
        priority: "l", // ❌ Not in ["low", "medium", "high"]
    },
});
// Throws: VALUE_NOT_MATCH_TYPE
```

**Test: Cascade deletion**

```javascript
const task = await taskServices.create({...});
const valueIds = await Value.findAll({ where: { taskId: task.id } });
await taskServices.delete(task.id);
const remainingValues = await Value.findAll({ where: { id: valueIds } });
// remainingValues.length === 0 ✓
```

## Best Practices

### 1. Always Provide Required Metadata

Even if using defaults, explicitly set required fields:

```javascript
metadata: {
    "start date": new Date(),
    "status": "not started",
    "priority": "medium"
}
```

### 2. Validate on Frontend

Pre-validate metadata before sending to prevent unnecessary API calls:

```javascript
function validateMetadata(metadata, planSchema) {
    for (const [key, value] of Object.entries(metadata)) {
        if (!planSchema[key]) {
            throw new Error(`Unknown field: ${key}`);
        }
        // Validate type...
    }
}
```

### 3. Handle Partial Updates

Only send changed fields in updates:

```javascript
// Good
await updateTask(id, {
    metadata: { status: "done" },
});

// Avoid
await updateTask(id, {
    metadata: {
        /* all fields even unchanged */
    },
});
```

### 4. Use Transactions

The service layer handles transactions automatically, ensuring data consistency.

### 5. Leverage Schema Flexibility

Define custom metadata per plan for different project types:

- Software development: story points, sprint, assigned developer
- Content creation: word count, publish date, author
- Personal tasks: energy level, context, location

## Related Files

- **Models:** `main/models/task.js`, `main/models/attribute.js`, `main/models/value.js`
- **Services:** `main/services/task.js`, `main/services/metadata.js`
- **Handlers:** `main/handlers/task.js`
- **Validation:** `main/config/constant.js`
- **Errors:** `main/errors/task.js`, `main/errors/global.js`
- **Frontend API:** `renderer/src/api/task.js`
- **Preload:** `preload/preload.js`
- **Tests:** `main/__tests__/main.test.mjs`
- **Examples:** `main/config/scripts.js`

## Summary

The Task Metadata System provides:

- ✅ Flexible, schema-based metadata
- ✅ Type validation and sanitization
- ✅ Default required fields
- ✅ Custom fields per plan
- ✅ Transaction safety
- ✅ Cascade deletion
- ✅ Clear error messages
- ✅ Frontend-friendly API

This architecture allows the application to adapt to different workflows while maintaining data integrity and consistency.
