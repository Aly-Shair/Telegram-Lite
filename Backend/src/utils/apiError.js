class ApiError extends Error{
    constructor(status, message = "something went wrong", error = []){
        super(message)
        this.status = status;
        this.message = `Error: ${message}`;
        this.error = error
        this.success = false
    }
}
 

export {
    ApiError
}