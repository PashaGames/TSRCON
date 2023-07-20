"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RconPacketType;
(function (RconPacketType) {
    RconPacketType[RconPacketType["SERVERDATA_RESPONSE_VALUE"] = 0] = "SERVERDATA_RESPONSE_VALUE";
    RconPacketType[RconPacketType["SERVERDATA_EXECCOMMAND"] = 2] = "SERVERDATA_EXECCOMMAND";
    RconPacketType[RconPacketType["SERVERDATA_AUTH"] = 3] = "SERVERDATA_AUTH";
})(RconPacketType || (RconPacketType = {}));
exports.default = RconPacketType;
