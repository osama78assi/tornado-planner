import ApplicationError from "../util/applicationError.js";

export const FOLDER_NOT_EXIST = new ApplicationError({
    message: "The folder isn't exist or already deleted",
    code: "FOLDER_NOT_EXIST",
});
