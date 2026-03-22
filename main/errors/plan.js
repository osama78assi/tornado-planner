// Centeral place for plan errors

import ApplicationError from "../util/applicationError.js";

export const PLAN_NOT_EXIST = new ApplicationError({
    message: "The plan isn't exist or already deleted",
    code: "PLAN_NOT_EXIST",
});
