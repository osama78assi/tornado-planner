import {
    INVALID_SCHEMA_ATTR,
    INVALID_SCHEMA_KEY,
    INVALID_SCHEMA_TYPE,
    INVALID_SCHEMA_VALUES,
    MISSING_ATTR_TYPE,
    INVALID_SCHEMA_VALUES_USAGE,
    INVALID_DATE_FORMAT,
} from "../errors/global.js";
import ApplicationError from "../util/applicationError.js";
import {
    checkApplicationSettings,
    getApplicationSettingsSync,
} from "./main.js";

// We should use this to check the user defined schemas
export function isValidSchemaKey(key) {
    if (typeof key === "string" && (key.length > 60 || key.length === 0)) {
        throw INVALID_SCHEMA_KEY;
    }
}

export function sanitizeMetadata(obj) {
    Object.keys(obj).forEach((key) => {
        const trimmedKey = key.trim();
        obj[trimmedKey] = structuredClone(obj[key]);

        // In this case only delete the key
        if (trimmedKey.length !== key.length) delete obj[key];

        // If there is values then trim the values and remove duplicated values and trim the values
        if (
            obj[trimmedKey].type === "check" &&
            obj[trimmedKey]?.values &&
            Array.isArray(obj[trimmedKey].values)
        ) {
            obj[trimmedKey].values = [
                ...new Set(
                    obj[trimmedKey]?.values
                        .map((v) => v?.trim?.() ?? v)
                        .filter((v) => v !== ""),
                ),
            ];
        }
    });
}

export function isValidSchema(obj, key) {
    // Check if the key is acceptable or not. This key is the column name
    isValidSchemaKey(key);

    const flags = {
        // Define is required valid or not
        isRequiredValid: false,

        // Define is optional valid or not
        isValuesArrValid: true,

        // Define a rule to not add more attributes
        isThereExtra: false,

        // Only type check accept values
        incorrectValuesUse: false,

        // Check if the date's format is valid or not
        isDateFormatValid: true,
    };
    for (let key of Object.keys(obj)) {
        // Check required attributes
        if (key === "type") {
            // Check the values it must equal to
            if (["date", "string", "number", "check"].includes(obj.type)) {
                flags.isRequiredValid = true;
            }
        } else if (key === "values") {
            // Check if the values of type array
            if (
                !Array.isArray(obj.values) ||
                obj.values.length === 0 ||
                obj.values.length > 20
            ) {
                // No longer valid
                flags.isValuesArrValid = false;
            }

            if (obj?.type !== "check") {
                flags.incorrectValuesUse = true;
            }
        } else if (key === "format") {
            // Check if the format is known
            if (!DATE_FORMATS[obj.format]) flags.isDateFormatValid = false;
        } else {
            // If reached this block that's mean there is unrecognized attribute
            flags.isThereExtra = true;
        }
    }

    // Throw errors accordingly
    if (!flags.isRequiredValid) {
        throw INVALID_SCHEMA_TYPE(key);
    }

    if (!flags.isValuesArrValid) {
        throw INVALID_SCHEMA_VALUES(key);
    }

    if (!flags.isDateFormatValid) {
        throw INVALID_DATE_FORMAT(key);
    }

    if (flags.incorrectValuesUse) {
        throw INVALID_SCHEMA_VALUES_USAGE(key);
    }

    if (flags.isThereExtra) {
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

// Take the user schema to extract the optional attributes if passed
export function DEFAULT_SCHEMA(key, userSchema) {
    const settings = getApplicationSettingsSync();

    switch (key) {
        case "start date":
            return {
                type: "date",
                format:
                    (userSchema?.format ?? null)
                        ? userSchema.format
                        : settings.dateFormat,
            };
        case "end date":
            return {
                type: "date",
                format:
                    (userSchema?.format ?? null)
                        ? userSchema.format
                        : settings.dateFormat,
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

export function getDefaultMetadata() {
    const settings = getApplicationSettingsSync();

    return {
        "start date": {
            type: "date",
            format: settings.dateFormat,
        },
        "end date": {
            type: "date",
            format: settings.dateFormat,
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
}

export const DATE_FORMATS = {
    // DD/MM/YYYY
    ddmmyyyy_12h: {
        locales: "en-GB",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    },
    ddmmyyyy_24h: {
        locales: "en-GB",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    },

    ddmmyyyy: {
        locales: "en-GB",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    },

    // MM/DD/YYYY
    mmddyyyy_12h: {
        locales: "en-US",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    },

    mmddyyyy_24h: {
        locales: "en-US",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    },

    mmddyyyy: {
        locales: "en-US",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    },
};

export const DEFAULT_SCHEMA_TYPES = ["date", "check", "string", "number"];

/*
https://www.npmjs.com/package/react-markdown
https://www.npmjs.com/package/markdown-to-txt
*/
