"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let io;

export function emit(event: types.PushEvent, arg: any) {
    io.emit(event, arg);
}

export function connect(server: libs.http.Server) {
    io = libs.socket(server);

    io.on("connection", socket => {
        let cookie = libs.validator.trim(socket.handshake.headers.cookie);
        let cookies = libs.cookie.parse(cookie);
        services.authenticationCredential.authenticateCookie(cookies[settings.cookieKeys.authenticationCredential]).then(userId => {
            if (!userId) {
                socket.disconnect(true);
            }
        });
    });
}
