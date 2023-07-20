"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RconPacketBuilder = void 0;
var RconPacketType_1 = require("./RconPacketType");
var RconError_1 = require("./RconError");
var RconPacketBuilder = /** @class */ (function () {
    function RconPacketBuilder(packetType, packetId, packetBody) {
        if (packetId === void 0) { packetId = 0; }
        if (packetBody === void 0) { packetBody = ''; }
        var description = {
            packetId: packetId,
            packetType: packetType,
            packetBody: packetBody
        };
        this.description = description;
    }
    RconPacketBuilder.prototype.getDescription = function () {
        return this.description;
    };
    RconPacketBuilder.prototype.setId = function (packetId) {
        this.description.packetId = packetId;
        return this;
    };
    RconPacketBuilder.prototype.getId = function () {
        return this.description.packetId;
    };
    RconPacketBuilder.prototype.getType = function () {
        return this.description.packetType;
    };
    RconPacketBuilder.prototype.getBody = function () {
        return this.description.packetBody;
    };
    RconPacketBuilder.prototype.setBody = function (body) {
        this.description.packetBody = body;
        return this;
    };
    RconPacketBuilder.fromBuffer = function (buffer) {
        var size = buffer.readInt32LE(0);
        if (size < 10)
            throw new RconError_1.default({
                name: "INVALID_PACKET_SIZE",
                message: "Encountered invalid packet size: " + size
            });
        var id = buffer.readInt32LE(4);
        var typeNum = buffer.readInt32LE(8);
        if (!(typeNum in RconPacketType_1.default))
            throw new RconError_1.default({
                name: "INVALID_PACKET_TYPE",
                message: "Encountered invalid packet type " + typeNum
            });
        var type = typeNum;
        var body = buffer.toString("ascii", 12, size + 2);
        return new RconPacketBuilder(type, id, body);
    };
    RconPacketBuilder.prototype.toBuffer = function () {
        var size = 10 + Buffer.byteLength(this.getBody());
        var buffer = Buffer.alloc(size + 4);
        buffer.writeInt32LE(size, 0);
        buffer.writeInt32LE(this.description.packetId, 4);
        buffer.writeInt32LE(this.description.packetType, 8);
        buffer.write(this.description.packetBody, 12, size + 2, "ascii");
        buffer.writeInt16LE(0, size + 2);
        return buffer;
    };
    RconPacketBuilder.prototype.toString = function () {
        return "".concat(this.getId(), "|").concat(this.getType(), "|").concat(this.getBody());
    };
    return RconPacketBuilder;
}());
exports.RconPacketBuilder = RconPacketBuilder;
