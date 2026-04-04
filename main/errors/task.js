import ApplicationError from "../util/applicationError.js";

export const TASK_WITH_NO_PLAN = new ApplicationError({
    message: "The task should have a plan",
    code: "TASK_WITH_NO_PLAN",
});

export const MISSING_PLAN = new ApplicationError({
    message: "The provided plan is not exsited or has been deleted",
    code: "MISSING_PLAN",
});

export const TASK_DELETED = new ApplicationError({
    message: "The task isn't existed or it's already deleted",
    code: "TASK_DELETED",
});

// Note this is a function, I will not throw error if the attribute isn't provided. So please :)
export const UNRECOGNIZED_ATTRIBUTE = (attribute) =>
    new ApplicationError({
        message: `The attribute ${attribute} isn't recognized`,
        code: "UNRECOGNIZED_ATTRIBUTE",
        attributes: { attribute },
    });

export const VALUE_NOT_MATCH_TYPE = (key, type) =>
    new ApplicationError({
        message: `The value of attribute ${key} doesn't match the type ${type}`,
        code: "VALUE_NOT_MATCH_TYPE",
        attributes: {
            key,
            type,
        },
    });
