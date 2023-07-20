type ErrorName = 
| 'INVALID_PACKET_SIZE'
| 'INVALID_PACKET_TYPE' |  "RCON_SOCKET_CLOSED" | "INVALID_PASSWORD";

export default class RconError extends Error {
    name: ErrorName;
    message: string;
    cause: unknown;

    constructor({name, message, cause}: {name: ErrorName, message: string, cause?: unknown}){
        super();
        this.name = name;
        this.message = message;
        this.cause = cause;
    }
} 