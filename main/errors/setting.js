import ApplicationError from "../util/applicationError.js";

export const FOLDER_NOT_EXISTS = new ApplicationError({
    code: "FOLDER_NOT_EXISTS",
    message:
        "The destination folder isn't exist. Please select another folder and export again",
});
