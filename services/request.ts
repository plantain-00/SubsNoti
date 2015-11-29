"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Response<T> {
    response: libs.http.IncomingMessage;
    body: T;
}

export function post<T>(options: any): Promise<Response<T>> {
    return new Promise<Response<T>>((resolve, reject) => {
        libs.request.post(options, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({
                response: response,
                body: JSON.parse(body),
            });
        });
    });
}

export function postAsync<T>(url: string, version: string, form): Promise<Response<T>> {
    let options = {
        url: url,
        form: form,
        headers: {
            "X-Version": version
        },
    };

    return post<T>(options);
}

export function postMultipartAsync<T>(url: string, version: string, formData: any): Promise<Response<T>> {
    let options = {
        url: url,
        formData: formData,
        headers: {
            "X-Version": version
        },
    };

    return post<T>(options);
}

export function get<T>(options: any, type: types.ResponseType): Promise<Response<T>> {
    return new Promise<Response<T>>((resolve, reject) => {
        libs.request(options, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({
                response: response,
                body: type === types.responseType.json ? JSON.parse(body) : body,
            });
        });
    });
}

export function getAsync<T>(url: string, type: types.ResponseType): Promise<Response<T>> {
    return get<T>({
        url: url
    }, type);
}
