import EventEmitter = require("node:events");
import net from 'net';
import {
    RconPacketBuilder
} from "./RconPacket";
import RconPacketType from "./RconPacketType";
import RconError from "./RconError";

export interface RconAddress {
    ip: string;
    port: number;
}

export class RconClient extends EventEmitter {
    private address: RconAddress;
    private password: string;
    private currentPacketID: number;
    private socket: null | net.Socket;
    private authenticated: boolean;
    public constructor(address: RconAddress, password: string = "") {
        super();
        this.address = address;
        this.password = password;
        this.socket = null;
        this.currentPacketID = 0;
        this.authenticated = false;
    }

    public connect(): Promise < RconClient > {
        return new Promise < RconClient > ((resolve, reject) => {
            this.socket = new net.Socket()
            this.socket.on("data", (data) => {

    
                this.emit("data", RconPacketBuilder.fromBuffer(data))
        
         
            })


            this.socket.on('error', () => reject(this));
            this.socket.on("close", (e: boolean) => {
                this.emit("close", e);
            })


            this.socket.connect(this.address.port, this.address.ip, () => {

                if (this.password != "") {
                    this.sendAuthentication().then((res: RconClient) => {
                        this.emit("auth",true);
                        this.authenticated = true;
                        resolve(res);
                    }).catch(() => {
                        this.authenticated = false;
                        this.emit("auth",false);
                        throw new RconError({
                            "name": "INVALID_PASSWORD",
                            "message": "Authentication failed."
                        })
                    });
                    return;
                }
                this.authenticated = true;
                resolve(this);
            })

        })
    }

    public disconnect(): void {
        this.socket?.end();
    }



    private getPacketID(): number {
        return this.currentPacketID++;
    }

    public sendBuffer(buffer: Buffer) {
        if (this.socket?.closed) {
            throw new RconError({
                name: "RCON_SOCKET_CLOSED",
                message: "Attempting to send a buffer when socket is closed."
            })
        }

        this.socket?.write(buffer);

    }

    public sendCommand(command: string) : Promise<RconPacketBuilder> {
        
        return new Promise<RconPacketBuilder>((resolve, reject) => {
            const id:number = this.getPacketID();
            this.sendBuffer(new RconPacketBuilder(RconPacketType.SERVERDATA_EXECCOMMAND,id,command).toBuffer());
         
            this.once("data", (packet:RconPacketBuilder) => {
                if(packet.getId() == id) resolve(packet);
                else reject(packet); 
            })
        });
    }
    public sendAuthentication(): Promise < RconClient > {
        return new Promise < RconClient > ((resolve, reject) => {
            this.once("data", (packet: RconPacketBuilder) => {
                if (packet.getType() == RconPacketType.SERVERDATA_RESPONSE_VALUE && packet.getId() != -1)
                    this.once("data", (packet: RconPacketBuilder) => {
                        if (packet.getType() == RconPacketType.SERVERDATA_EXECCOMMAND && packet.getId() != -1)
                            resolve(this)
                        else
                            reject(this)
                    })
                else
                    reject(this);
            })
            this.sendBuffer(new RconPacketBuilder(RconPacketType.SERVERDATA_AUTH, this.getPacketID(), this.password).toBuffer());
      
        })

    }

}