import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

const key = "x-real-ip";

export function getFromWs(socket: SocketIO.Socket): string {
    return socket.handshake.headers[key] || socket.handshake.address;
}
export function getFromHttp(request: libs.Request): string {
    return request.header(key) || request.ip;
}
