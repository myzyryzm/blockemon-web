/** @format */

class HttpError extends Error {
    public code: string
    constructor(message, errorCode) {
        super(message) // Add a "message" property
        this.code = errorCode // Adds a "code" property
    }
}
export default HttpError
