import { takeFieldByKey } from "./main";

// Sort comparison function for table columns
export function compareValues(a, b, column) {
    // Default sort by dataIndex field
    const aValue = takeFieldByKey(a, column.dataIndex);
    const bValue = takeFieldByKey(b, column.dataIndex);

    // Handle different types
    if (column.type === "number") {
        return (aValue || 0) - (bValue || 0);
    } else if (column.type === "date") {
        const aDate = aValue ? new Date(aValue).getTime() : 0;
        const bDate = bValue ? new Date(bValue).getTime() : 0;
        return aDate - bDate;
    } else {
        // Default string comparison
        const aStr = String(aValue || "");
        const bStr = String(bValue || "");
        return aStr.localeCompare(bStr);
    }
}

// Filter function for text columns
export function filterTextValue(rowValue, filterValue) {
    // Regex search (case-insensitive)
    if (!filterValue) return true;
    try {
        const regex = new RegExp(filterValue, "i");
        return regex.test(String(rowValue || ""));
    } catch {
        return String(rowValue || "")
            .toLowerCase()
            .includes(String(filterValue).toLowerCase());
    }
}

// Filter function for number columns
export function filterNumberValue(rowValue, filterValue) {
    // Exact match
    if (!filterValue) return true;
    return rowValue == filterValue;
}

// Filter function for date columns
export function filterDateValue(rowValue, filterValue) {
    // Date-only comparison (ignore time)
    if (!filterValue) return true;
    if (!rowValue) return false;
    const rowDate = new Date(rowValue).toDateString();
    const filterDate = new Date(filterValue).toDateString();
    return rowDate === filterDate;
}

// Filter function for check columns
export function filterCheckValue(rowValue, filterValue) {
    // Contains check (for multiple selected values)
    if (!filterValue || filterValue.length === 0) return true;
    return filterValue.includes(rowValue);
}

// Apply filter based on column type
export function applyColumnFilter(rowValue, filterValue, columnType) {
    switch (columnType) {
        case "text":
            return filterTextValue(rowValue, filterValue);
        case "number":
            return filterNumberValue(rowValue, filterValue);
        case "date":
            return filterDateValue(rowValue, filterValue);
        case "check":
            return filterCheckValue(rowValue, filterValue);
        default:
            return true;
    }
}

/**
 * Synchronize task completed field with status metadata (mutates payload by reference)
 * @param {Object} payload - Task payload with optional completed and metadata.status fields
 */
export function synchronizeTaskStatus(payload) {
    // If completed is explicitly set
    if (typeof payload.completed === "boolean") {
        // Ensure metadata exists
        if (!payload.metadata) {
            payload.metadata = {};
        }

        // Sync status based on completed
        if (payload.completed === true) {
            payload.metadata.status = "done";
        } else if (payload.completed === false) {
            payload.metadata.status = "not started";
        }
    }

    // If status is set in metadata
    if (payload.metadata?.status) {
        // Sync completed based on status
        if (payload.metadata.status === "done") {
            payload.completed = true;
        } else {
            payload.completed = false;
        }
    }
}

