import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Response<T> {
    response: libs.http.IncomingMessage;
    body: T;
}

export function post<T>(options: libs.request.Options): Promise<Response<T>> {
    return new Promise<Response<T>>((resolve, reject) => {
        libs.request.post(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    response: response,
                    body: JSON.parse(body),
                });
            }
        });
    });
}

export function postAsync<T>(url: string, form): Promise<Response<T>> {
    const options = {
        url: url,
        form: form,
        headers: {},
    };

    options.headers[settings.headerNames.version] = settings.version;

    return post<T>(options);
}

export function postMultipartAsync<T>(url: string, formData: any): Promise<Response<T>> {
    const options = {
        url: url,
        formData: formData,
        headers: {},
    };

    options.headers[settings.headerNames.version] = settings.version;

    return post<T>(options);
}

export function get<T>(options: libs.request.Options, type?: types.ResponseType): Promise<Response<T>> {
    if (!type) {
        type = types.responseType.json;
    }
    return new Promise<Response<T>>((resolve, reject) => {
        libs.request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve({
                    response: response,
                    body: type === types.responseType.json ? JSON.parse(body) : body,
                });
            }
        });
    });
}

export function getAsync<T>(url: string, type?: types.ResponseType): Promise<Response<T>> {
    return get<T>({
        url: url,
    }, type);
}

export function request<T>(options: libs.request.Options, type?: types.ResponseType) {
    if (!type) {
        type = types.responseType.json;
    }

    return new Promise<[libs.http.IncomingMessage, T]>((resolve, reject) => {
        libs.request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve([response, type === types.responseType.json ? JSON.parse(body) : body]);
            }
        });
    });
}
