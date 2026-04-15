class ApiError extends Error {
    constructor(statusCode, message = "Something went wrong", errors = []) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;
        this.errors = Array.isArray(errors) ? errors : [errors];
        this.success = false;
    }
}

export default ApiError;
