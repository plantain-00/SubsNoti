"use strict";
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
let io;
let themes;
function emitTheme(event, theme) {
    themes.to(theme.organizationId).emit(event, theme);
}
exports.emitTheme = emitTheme;
function connect(server) {
    io = libs.socket(server);
    themes = io.of("/themes");
    themes.on("connection", socket => {
        const cookie = typeof socket.handshake.headers.cookie === "string" ? libs.validator.trim(socket.handshake.headers.cookie) : "";
        const cookies = libs.cookie.parse(cookie);
        services.authenticationCredential.authenticateCookie(cookies[settings.cookieKeys.authenticationCredential]).then(userId => {
            if (!userId) {
                socket.disconnect(true);
            }
            else {
                socket.on("change organization", (data) => {
                    for (const room of socket.rooms) {
                        socket.leave(room);
                    }
                    socket.join(data.to);
                });
            }
        });
    });
}
exports.connect = connect;
