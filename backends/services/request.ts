"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Response {
    response: libs.http.IncomingMessage;
    json: any;
}

function post(options: any): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        libs.request.post(options, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({
                response: response,
                json: JSON.parse(body),
            });
        });
    });
}

export function postAsync(url: string, form): Promise<Response> {
    let options = {
        url: url,
        form: form,
    };

    return post(options);
}

export function postMultipartAsync(url: string, formData: any): Promise<Response> {
    let options = {
        url: url,
        formData: formData,
    };

    return post(options);
}

interface GetResponse {
    response: libs.http.IncomingMessage;
    body: any;
}

export function getAsync(url: string): Promise<GetResponse> {
    return new Promise<GetResponse>((resolve, reject) => {
        libs.request(url, (error, response, body) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({
                response: response,
                body: body,
            });
        });
    });
}
