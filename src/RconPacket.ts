import RconPacketType from "./RconPacketType";
import RconError from "./RconError";
export interface RconPacketDescription {
    packetId: number;
    packetType: RconPacketType;
    packetBody: string;
}

export class RconPacketBuilder {
    private description: RconPacketDescription;

    public constructor(packetType: RconPacketType, packetId: number = 0, packetBody: string = '') {
        const description: RconPacketDescription = {
            packetId: packetId,
            packetType: packetType,
            packetBody: packetBody
        };
        this.description = description;
    }




    public getDescription(): RconPacketDescription {
        return this.description;
    }

    public setId(packetId: number): RconPacketBuilder {
        this.description.packetId = packetId;
        return this;
    }

    public getId(): number {
        return this.description.packetId
    }

    public getType(): RconPacketType {
        return this.description.packetType;
    }

    public getBody(): string {
        return this.description.packetBody
    }

    public setBody(body: string): RconPacketBuilder {
        this.description.packetBody = body;
        return this;
    }

    public static fromBuffer(buffer: Buffer): RconPacketBuilder {
        const size: number = buffer.readInt32LE(0);
        if (size < 10) throw new RconError({
            name: "INVALID_PACKET_SIZE",
            message: "Encountered invalid packet size: " + size
        });
        const id: number = buffer.readInt32LE(4);

        const typeNum: number = buffer.readInt32LE(8);
        if (!(typeNum in RconPacketType)) throw new RconError({
            name: "INVALID_PACKET_TYPE",
            message: "Encountered invalid packet type " + typeNum
        });
        const type: RconPacketType = typeNum as RconPacketType;
        const body: string = buffer.toString("ascii", 12, size+2);
        return new RconPacketBuilder(type, id, body);

    }


    public toBuffer(): Buffer {
        const size: number = 10 + Buffer.byteLength(this.getBody());
        const buffer: Buffer = Buffer.alloc(size + 4);
       
        buffer.writeInt32LE(size, 0);
        buffer.writeInt32LE(this.description.packetId, 4);
        buffer.writeInt32LE(this.description.packetType, 8);
        buffer.write(this.description.packetBody, 12, size + 2, "ascii");
        buffer.writeInt16LE(0, size + 2);
 
        return buffer;
    }

    public toString(): string {
        return `${this.getId()}|${this.getType()}|${this.getBody()}` 
    }
}