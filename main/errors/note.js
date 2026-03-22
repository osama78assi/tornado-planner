import ApplicationError from "../util/applicationError.js";

export const NOTE_NOT_EXIST = new ApplicationError({
    message: "The note isn't exist or already deleted",
    code: "NOTE_NOT_EXIST",
});
