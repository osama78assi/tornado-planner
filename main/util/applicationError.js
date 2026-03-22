class ApplicationError extends Error {
    constructor({ message, code, hints, attributes }, options) {
        super(message, options);
        if (code) this.code = code;
        if (message) this.message = message;
        if (hints) this.hints = hints;

        // This must be an object
        if (attributes) this.attributes = attributes;
    }
}

export function errorHandler(err) {
    if (err instanceof ApplicationError) {
        return {
            success: false,
            code: err.code,
            message: err.message,
            ...(err.hints ? { hints: err.hints } : {}),
            ...(err.attributes ? { attributes: err.attributes } : {}),
        };
    }
    
    return {
        success: false,
        message: "something went wrong",
        code: "UNKNOWN_ERROR",
    };
}

export default ApplicationError;
