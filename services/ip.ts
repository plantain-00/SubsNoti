export function getFromWs(socket: SocketIO.Socket): string {
    return socket.handshake.headers["x-real-ip"] || socket.handshake.address;
}
