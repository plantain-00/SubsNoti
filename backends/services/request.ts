"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

function post(url: string, form, next: (error: Error, response: { response: libs.http.IncomingMessage, json: any }) => void) {
    libs.request.post({
        url: url,
        form: form,
    }, (error, response, body) => {
        next(error, {
            response: response,
            json: JSON.parse(body),
        });
    });
}

export let postAsync = services.promise.promisify3<string, any, { response: libs.http.IncomingMessage, json: any }>(post);

function postMultipart(url: string, formData, next: (error: Error, response: { response: libs.http.IncomingMessage, json: any }) => void) {
    libs.request.post({
        url: url,
        formData: formData,
    }, (error, response, body) => {
        next(error, {
            response: response,
            json: JSON.parse(body),
        });
    });
}

export let postMultipartAsync = services.promise.promisify3<string, any, { response: libs.http.IncomingMessage, json: any }>(postMultipart);

function get(url: string, next: (error: Error, response: { response: libs.http.IncomingMessage, body: string }) => void) {
    libs.request(url, (error, response, body) => {
        next(error, {
            response: response,
            body: body,
        });
    });
}

export let getAsync = services.promise.promisify2<string, { response: libs.http.IncomingMessage, body: string }>(get);
