import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import services = require("../services/services");

export function send(response:libs.Response, errorMessage:string, errorCode:enums.ErrorCode, statusCode:enums.StatusCode, documentUrl:string) {
    response.status(200).json({
        isSuccess: errorCode == enums.ErrorCode.success,
        statusCode: statusCode,
        errorCode: errorCode,
        errorMessage: errorMessage,
        documentUrl: documentUrl
    });
}

export function sendContentTypeError(response:libs.Response, documentUrl:string):void {
    send(response, "Content-Type is not application/json", enums.ErrorCode.wrongContentType, enums.StatusCode.invalidRequest, documentUrl);
}

export function sendParameterMissedError(response:libs.Response, documentUrl:string):void {
    send(response, "parameter is missed", enums.ErrorCode.parameterMissed, enums.StatusCode.invalidRequest, documentUrl);
}