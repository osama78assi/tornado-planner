import {
    INVALID_SCHEMA_ATTR,
    INVALID_SCHEMA_KEY,
    INVALID_SCHEMA_TYPE,
    INVALID_SCHEMA_VALUES,
    MISSING_ATTR_TYPE,
    INVALID_SCHEMA_VALUES_USAGE,
    INVALID_CHECK_VALUES,
} from "../errors/global.js";
import ApplicationError from "../util/applicationError.js";

// We should use this to check the user defined schemas
export function isValidSchemaKey(key) {
    if (typeof key === "string" && (key.length > 60 || key.length === 0)) {
        throw INVALID_SCHEMA_KEY;
    }
}

export function sanitizeMetadata(obj) {
    Object.keys(obj).forEach((key) => {
        const trimmedKey = key.trim();
        obj[trimmedKey] = obj[key];

        // In this case only delete the key
        if (trimmedKey.length !== key.length) delete obj[key];

        // If there is values then trim the values and remove duplicated values and trim the values
        if (obj[trimmedKey]?.values && Array.isArray(obj[trimmedKey].values)) {
            obj[trimmedKey].values = [
                ...new Set(obj[trimmedKey]?.values.map((v) => v.trim())),
            ];
        } else {
            throw INVALID_CHECK_VALUES;
        }
    });
}

export function isValidSchema(obj, key) {
    // Check if the key is acceptable or not. This key is the column name
    isValidSchemaKey(key);

    // Define is required valid or not
    let isRequiredValid = false;

    // Define is optional valid or not
    let isOptionaValid = true;

    // Define a rule to not add more attributes
    let isThereExtra = false;

    // Only type check accept values
    let incorrectValuesUse = false;

    for (let key of Object.keys(obj)) {
        // Check required attributes
        if (key === "type") {
            // Check the values it must equal to
            if (["date", "string", "number", "check"].includes(obj.type)) {
                isRequiredValid = true;
            }
        } else if (key === "values") {
            // Check if the values of type array
            if (
                !Array.isArray(obj.values) ||
                obj.values.length === 0 ||
                obj.values.length > 20
            ) {
                // No longer valid
                isOptionaValid = false;
            }

            if (obj?.type !== "check") {
                incorrectValuesUse = true;
            }
        } else {
            // If reached this block that's mean there is unrecognized attribute
            isThereExtra = true;
        }
    }

    // Throw errors accordingly
    if (!isRequiredValid) {
        throw INVALID_SCHEMA_TYPE(key);
    }

    if (!isOptionaValid) {
        throw INVALID_SCHEMA_VALUES(key);
    }

    if (incorrectValuesUse) {
        throw INVALID_SCHEMA_VALUES_USAGE(key);
    }

    if (isThereExtra) {
        throw INVALID_SCHEMA_ATTR(key);
    }
}

// The required keys in the metadata
export const REQUIRED_SCHEMAS = [
    "start date",
    "end date",
    "status",
    "priority",
];

// Define how to validate each field for the tasks
export function isValidValue(metadataAttr, value) {
    // If the type isn't found then throw an error
    if (!metadataAttr.type) {
        throw MISSING_ATTR_TYPE;
    }

    switch (metadataAttr.type) {
        case "date":
            // Check if it's date instance already
            if (value instanceof Date) {
                return true;
            }

            // Check if we can parse it
            if (new Date(value) != "Invalid Date") {
                return true;
            }

            // Return false
            return false;
        case "string":
            if (typeof value === "string" || String(value)) return true;
            return false;

        case "number":
            if (!isNaN(Number(value))) return true;
            return false;

        case "check":
            if (value === null || metadataAttr.values?.includes(value))
                return true;
            return false;

        default:
            // If reached here then it's false
            return false;
    }
}

export function DEFAULT_SCHEMA(key) {
    switch (key) {
        case "start date":
            return {
                type: "date",
            };
        case "end date":
            return {
                type: "date",
            };
        case "status":
            return {
                type: "check",
                values: ["done", "in progress", "not started", "discarded"],
            };
        case "priority":
            return {
                type: "check",
                values: ["low", "medium", "high"],
            };
    }
}

export const DEFAULT_METADATA = {
    "start date": {
        type: "date",
    },
    "end date": {
        type: "date",
    },
    status: {
        type: "check",
        values: ["done", "in progress", "not started", "discarded"],
    },
    priority: {
        type: "check",
        values: ["low", "medium", "high"],
    },
};

export const DEFAULT_SCHEMA_TYPES = ["date", "check", "string", "number"];

/*
https://www.npmjs.com/package/react-markdown
https://www.npmjs.com/package/markdown-to-txt
*/
