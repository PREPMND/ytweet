class apiError extends Error {
    constructor(statusCode, message = "Something Went Wrong", errors = [], stack) {
        super(message);

        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        // The old default was `stack = " "` -- a truthy string -- so EVERY
        // error lost its real stack trace. Default to undefined instead.
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { apiError };
