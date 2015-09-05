import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

function send(response:libs.Response, errorMessage:string, errorCode:enums.ErrorCode, statusCode:enums.StatusCode, documentUrl:string, result?:any) {
    if (!result) {
        result = {}
    }
    result.isSuccess = errorCode == enums.ErrorCode.success;
    result.statusCode = statusCode;
    result.errorCode = errorCode;
    result.errorMessage = errorMessage;
    result.documentUrl = documentUrl;

    response.status(200).json(result);
}

export function sendContentTypeError(response:libs.Response, documentUrl:string):void {
    send(response, "Content-Type is not application/json", enums.ErrorCode.wrongContentType, enums.StatusCode.invalidRequest, documentUrl);
}

export function sendParameterMissedError(response:libs.Response, documentUrl:string):void {
    send(response, "parameter is missed", enums.ErrorCode.parameterMissed, enums.StatusCode.invalidRequest, documentUrl);
}

export function sendDBAccessError(response:libs.Response, errorMessage:string, documentUrl:string):void {
    send(response, errorMessage, enums.ErrorCode.dbAccessError, enums.StatusCode.internalServerError, documentUrl);
}

export function sendCreatedOrModified(response:libs.Response, documentUrl:string):void {
    send(response, "", enums.ErrorCode.success, enums.StatusCode.createdOrModified, documentUrl);
}

export function sendAccountInWrongStatusError(response:libs.Response, errorMessage:string, documentUrl:string):void {
    send(response, errorMessage, enums.ErrorCode.accountInWrongStatus, enums.StatusCode.unprocessableEntity, documentUrl);
}

export function sendEmailServiceError(response:libs.Response, errorMessage:string, documentUrl:string):void {
    send(response, errorMessage, enums.ErrorCode.emailServiceError, enums.StatusCode.internalServerError, documentUrl);
}

export function sendUnauthorizedError(response:libs.Response, errorMessage:string, documentUrl:string):void {
    send(response, errorMessage, enums.ErrorCode.unauthorizedError, enums.StatusCode.unauthorized, documentUrl);
}

export function sendOK(response:libs.Response, documentUrl:string, result?:any):void {
    send(response, "", enums.ErrorCode.success, enums.StatusCode.OK, documentUrl, result);
}

function sendWrongHttpMethod(response:libs.Response, documentUrl:string):void {
    send(response, "current http method is not right for the api", enums.ErrorCode.wrongHttpMethod, enums.StatusCode.invalidRequest, documentUrl);
}

export function notGet(app:libs.Application, api:interfaces.ApiDocument) {
    app.get(api.url, (request:libs.Request, response:libs.Response)=> {
        sendWrongHttpMethod(response, api.documentUrl);
    });
}