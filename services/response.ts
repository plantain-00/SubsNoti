import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function sendSuccess(response: libs.Response, statusCode: types.StatusCode, result?: Object) {
    if (!result) {
        result = {};
    }

    let baseResponse: types.Response = {
        isSuccess: true,
        statusCode: statusCode,
    };

    response.status(types.StatusCode.OK).json(libs._.extend(baseResponse, result));
}

export function sendError(response: libs.Response, error: types.E, documentUrl?: string) {
    let isE = error.statusCode;

    let baseResponse: types.Response = {
        isSuccess: false,
        statusCode: isE ? error.statusCode : types.StatusCode.internalServerError,
        errorMessage: isE ? error.message : "something happens unexpectedly.",
        documentUrl: settings.documentServer.get(settings.currentEnvironment) + (documentUrl ? documentUrl : response.documentUrl),
    };

    if (!isE) {
        baseResponse.actualErrorMessage = error.message;
    }

    if (settings.currentEnvironment !== types.environment.production) {
        baseResponse.stack = error.stack;
    }

    response.status(types.StatusCode.OK).json(baseResponse);
}
