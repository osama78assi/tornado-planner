// A centar place to export global errors in the application

import ApplicationError from "../util/applicationError.js";

export const INVALID_SCHEMA_KEY = new ApplicationError({
    message: `Maximum key length is 60, and minmum is 1`,
    code: "INVALID_SCHEMA_KEY",
});

export const INVALID_SCHEMA_TYPE = (schema) =>
    new ApplicationError({
        message: `The attribute 'type' in schema ${schema} is required in the schema`,
        code: "INVALID_SCHEMA_TYPE",
        attributes: { schema },
    });

export const INVALID_SCHEMA_VALUES_USAGE = (schema) =>
    new ApplicationError({
        message: `The attribute 'values' in schema ${schema} isn't acceptable, because the type isn't 'check'`,
        code: "INVALID_SCHEMA_VALUES_USAGE",
        attributes: { schema },
    });

export const INVALID_SCHEMA_VALUES = (schema) =>
    new ApplicationError({
        message: `The attribute 'values' in schema ${schema} must be of type array, and length is between 0 and 20`,
        code: "INVALID_SCHEMA_VALUES",
        attributes: { schema },
    });

export const INVALID_SCHEMA_ATTR = (schema) =>
    new ApplicationError({
        message: `Unrecognized attribute in the schema ${schema}`,
        code: "INVALID_SCHEMA_ATTR",
        attributes: { schema },
    });

export const INVALID_DATE_FORMAT = (schema) =>
    new ApplicationError({
        message: `Attribute 'format', date format isn't recognized in the schema ${schema}`,
        code: "INVALID_DATE_FORMAT",
        attributes: { schema },
    });

export const MISSING_ATTR_TYPE = new ApplicationError({
    message: "The 'type' attribute isn't exists",
    code: "MISSING_ATTR_TYPE",
});

export const INVALID_PAGINATION_PAGE = new ApplicationError({
    message: "The page must be a number",
    code: "INVALID_PAGINATION_PAGE",
});

export const INVALID_PAGINATION_LIMIT = new ApplicationError({
    message: "The limit must be a number",
    code: "INVALID_PAGINATION_LIMIT",
});

export const UNINITIALIZED_SETTINGS = new ApplicationError({
    message: "Settings not initialized",
    code: "UNINITIALIZED_SETTINGS",
});

export const ALLOCATED_COLUMNS = (key) =>
    new ApplicationError({
        message: `The schema name '${key}' is already allocated before`,
        code: "ALLOCATED_COLUMNS",
    });
