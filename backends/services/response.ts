"use strict";

import * as types from "../../common/types";

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

    response.status(200).json(libs._.extend(baseResponse, result));
}

export function sendError(response: libs.Response, error: types.E, documentUrl: string) {
    let isE = error.statusCode;

    let baseResponse: types.Response = {
        isSuccess: false,
        statusCode: isE ? error.statusCode : types.StatusCode.internalServerError,
        errorMessage: isE ? error.message : "something happens unexpectedly.",
        documentUrl: documentUrl,
    };

    if (!isE) {
        baseResponse.actualErrorMessage = error.message;
    }

    if (settings.config.currentEnvironment === types.environment.development) {
        baseResponse.stack = error.stack;
    }

    response.status(200).json(baseResponse);
}
