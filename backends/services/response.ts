'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

function send(response: libs.Response, errorMessage: string, errorCode: enums.ErrorCode, statusCode: enums.StatusCode, documentUrl: string, result?: Object) {
    if (!result) {
        result = {};
    }

    var baseResponse: interfaces.Response = {
        isSuccess: errorCode == enums.ErrorCode.success,
        statusCode: statusCode,
        errorCode: errorCode,
        errorMessage: errorMessage,
        documentUrl: documentUrl
    };

    response.status(200).json(libs._.extend(baseResponse, result));
}

export function sendError(response: libs.Response, documentUrl: string, error: interfaces.E) {
    switch (error.code) {
        case enums.ErrorCode.dbAccessError:
        case enums.ErrorCode.emailServiceError:
            send(response, error.message, error.code, enums.StatusCode.internalServerError, documentUrl);
            break;
        case enums.ErrorCode.unauthorizedError:
            send(response, error.message, error.code, enums.StatusCode.unauthorized, documentUrl);
            break;
    }
}

export function sendContentTypeError(response: libs.Response, documentUrl: string): void {
    send(response, "Content-Type is not 'application/json' or 'application/x-www-form-urlencoded'", enums.ErrorCode.wrongContentType, enums.StatusCode.invalidRequest, documentUrl);
}

export function sendParameterMissedError(response: libs.Response, documentUrl: string): void {
    send(response, "parameter is missed", enums.ErrorCode.parameterMissed, enums.StatusCode.invalidRequest, documentUrl);
}

export function sendInvalidParameterError(response: libs.Response, documentUrl: string): void {
    send(response, "parameter is invalid", enums.ErrorCode.invalidParameter, enums.StatusCode.invalidRequest, documentUrl);
}

export function sendCreatedOrModified(response: libs.Response, documentUrl: string): void {
    send(response, "", enums.ErrorCode.success, enums.StatusCode.createdOrModified, documentUrl);
}

export function sendUnauthorizedError(response: libs.Response, errorMessage: string, documentUrl: string): void {
    send(response, errorMessage, enums.ErrorCode.unauthorizedError, enums.StatusCode.unauthorized, documentUrl);
}

export function sendOK(response: libs.Response, documentUrl: string, result?: Object): void {
    send(response, "", enums.ErrorCode.success, enums.StatusCode.OK, documentUrl, result);
}

export function sendDeleted(response: libs.Response, documentUrl: string, result?: Object): void {
    send(response, "", enums.ErrorCode.success, enums.StatusCode.deleted, documentUrl, result);
}

export function sendAlreadyExistError(response: libs.Response, errorMessage: string, documentUrl: string): void {
    send(response, errorMessage, enums.ErrorCode.alreadyExistError, enums.StatusCode.invalidRequest, documentUrl);
}

function sendWrongHttpMethod(response: libs.Response, documentUrl: string): void {
    send(response, "current http method is not right for the api", enums.ErrorCode.wrongHttpMethod, enums.StatusCode.invalidRequest, documentUrl);
}

interface ApiDocument {
    url: string;
    method: string;
    documentUrl?: string;
}

export function notGet(app: libs.Application, api: ApiDocument) {
    app.get(api.url, (request: libs.Request, response: libs.Response) => {
        sendWrongHttpMethod(response, api.documentUrl);
    });
}
