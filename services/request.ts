import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export function request<T>(options: libs.request.Options, type: types.ResponseType = types.responseType.json) {
    return new Promise<[libs.http.IncomingMessage, T]>((resolve, reject) => {
        options.headers![services.settings.headerNames.version] = services.settings.version;
        libs.request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve([response, type === types.responseType.json ? JSON.parse(body) : body]);
            }
        });
    });
}
