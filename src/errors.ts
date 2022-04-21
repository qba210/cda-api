export class NotFoundError extends Error{
    desc: string;
    constructor(message: string){
        let msg = `Requested resource was not found on server: ${message}`;
        super(msg);
        this.name = "404NotFoundError";
        this.message = msg;
        this.desc = message;
    }
}