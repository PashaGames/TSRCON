"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RconClient = void 0;
var EventEmitter = require("node:events");
var net_1 = require("net");
var RconPacket_1 = require("./RconPacket");
var RconPacketType_1 = require("./RconPacketType");
var RconError_1 = require("./RconError");
var RconClient = /** @class */ (function (_super) {
    __extends(RconClient, _super);
    function RconClient(address, password) {
        if (password === void 0) { password = ""; }
        var _this = _super.call(this) || this;
        _this.address = address;
        _this.password = password;
        _this.socket = null;
        _this.currentPacketID = 0;
        _this.authenticated = false;
        return _this;
    }
    RconClient.prototype.connect = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.socket = new net_1.default.Socket();
            _this.socket.on("data", function (data) {
                _this.emit("data", RconPacket_1.RconPacketBuilder.fromBuffer(data));
            });
            _this.socket.on('error', function () { return reject(_this); });
            _this.socket.on("close", function (e) {
                _this.emit("close", e);
            });
            _this.socket.connect(_this.address.port, _this.address.ip, function () {
                if (_this.password != "") {
                    _this.sendAuthentication().then(function (res) {
                        _this.emit("auth", true);
                        _this.authenticated = true;
                        resolve(res);
                    }).catch(function () {
                        _this.authenticated = false;
                        _this.emit("auth", false);
                        throw new RconError_1.default({
                            "name": "INVALID_PASSWORD",
                            "message": "Authentication failed."
                        });
                    });
                    return;
                }
                _this.authenticated = true;
                resolve(_this);
            });
        });
    };
    RconClient.prototype.disconnect = function () {
        var _a;
        (_a = this.socket) === null || _a === void 0 ? void 0 : _a.end();
    };
    RconClient.prototype.getPacketID = function () {
        return this.currentPacketID++;
    };
    RconClient.prototype.sendBuffer = function (buffer) {
        var _a, _b;
        if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.closed) {
            throw new RconError_1.default({
                name: "RCON_SOCKET_CLOSED",
                message: "Attempting to send a buffer when socket is closed."
            });
        }
        (_b = this.socket) === null || _b === void 0 ? void 0 : _b.write(buffer);
    };
    RconClient.prototype.sendCommand = function (command) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var id = _this.getPacketID();
            _this.sendBuffer(new RconPacket_1.RconPacketBuilder(RconPacketType_1.default.SERVERDATA_EXECCOMMAND, id, command).toBuffer());
            _this.once("data", function (packet) {
                if (packet.getId() == id)
                    resolve(packet);
                else
                    reject(packet);
            });
        });
    };
    RconClient.prototype.sendAuthentication = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.once("data", function (packet) {
                if (packet.getType() == RconPacketType_1.default.SERVERDATA_RESPONSE_VALUE && packet.getId() != -1)
                    _this.once("data", function (packet) {
                        if (packet.getType() == RconPacketType_1.default.SERVERDATA_EXECCOMMAND && packet.getId() != -1)
                            resolve(_this);
                        else
                            reject(_this);
                    });
                else
                    reject(_this);
            });
            _this.sendBuffer(new RconPacket_1.RconPacketBuilder(RconPacketType_1.default.SERVERDATA_AUTH, _this.getPacketID(), _this.password).toBuffer());
        });
    };
    return RconClient;
}(EventEmitter));
exports.RconClient = RconClient;
