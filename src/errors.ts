export class CdaApiError extends Error{
    desc: string;
    constructor(message: string){ super(message); this.desc = message }
}

export class NotFoundError extends CdaApiError{
    constructor(message: string){
        let msg = `Requested resource was not found on server: ${message}`;
        super(msg);
        this.name = "404NotFoundError";
        this.message = msg;
        this.desc = message;
    }
}

export class InvalidIDError extends CdaApiError{
    constructor(message: string){
        let msg = `Id ${message} does not exist`;
        super(msg);
        this.name = "InvalidIDError";
        this.message = msg;
        this.desc = message;
    }
}