import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

let io: SocketIO.Server;
let themes: SocketIO.Namespace;

export function emitTheme(event: types.ThemePushEvent, theme: types.Theme) {
    themes.to(theme.organizationId).emit(event, theme);
}

export function connect(server: libs.http.Server) {
    io = libs.socket(server);
    io.adapter(libs.socketioRedis({ host: services.redis.config.host, port: services.redis.config.port }));
    themes = io.of("/themes");

    themes.on("connection", socket => {
        const cookie = typeof socket.handshake.headers.cookie === "string" ? libs.validator.trim(socket.handshake.headers.cookie) : "";
        const cookies = libs.cookie.parse(cookie);
        services.authenticationCredential.authenticateCookie(cookies[services.settings.cookieKeys.authenticationCredential]).then(userId => {
            if (!userId) {
                socket.disconnect(true);
            } else {
                socket.on("change organization", (data: { to: string; }) => {
                    for (const room in socket.rooms) {
                        socket.leave(room);
                    }
                    socket.join(data.to);
                });
            }
        });
    });
}
