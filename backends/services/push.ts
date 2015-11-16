"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let io;

export function emit(event: string, arg: any) {
    io.emit(event, arg);
}

export function connect(server: libs.http.Server) {
    io = libs.socket(server);

    io.on("connection", socket => {
        let cookies = libs.cookie.parse(socket.handshake.headers.cookie);
        services.authenticationCredential.authenticateCookie(cookies[settings.config.cookieKeys.authenticationCredential]).catch(error=> {
            socket.disconnect(true);
        });
    });
}
