import ApplicationError from "../util/applicationError.js";

export const WORKSPACE_NOT_EXIST = new ApplicationError({
    message: "The workspace isn't exist or already deleted",
    code: "WORKSPACE_NOT_EXIST",
});
