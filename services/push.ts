"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let io;
let themes;

export function emitTheme(event: types.ThemePushEvent, theme: types.Theme) {
    themes.to(theme.organizationId).emit(event, theme);
}

export function connect(server: libs.http.Server) {
    io = libs.socket(server);
    themes = io.of("/themes");

    themes.on("connection", socket => {
        let cookie = libs.validator.trim(socket.handshake.headers.cookie);
        let cookies = libs.cookie.parse(cookie);
        services.authenticationCredential.authenticateCookie(cookies[settings.cookieKeys.authenticationCredential]).then(userId => {
            if (!userId) {
                socket.disconnect(true);
            } else {
                socket.on("change organization", (data: { to: string; }) => {
                    for (let room of socket.rooms) {
                        socket.leave(room);
                    }
                    socket.join(data.to);
                });
            }
        });
    });
}
