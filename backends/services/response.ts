"use strict";

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function sendSuccess(response: libs.Response, statusCode: enums.StatusCode, result?: Object) {
    if (!result) {
        result = {};
    }

    let baseResponse: interfaces.Response = {
        isSuccess: true,
        statusCode: statusCode,
    };

    response.status(200).json(libs._.extend(baseResponse, result));
}

export function sendError(response: libs.Response, error: interfaces.E, documentUrl: string) {
    let isE = error.statusCode;

    let baseResponse: interfaces.Response = {
        isSuccess: false,
        statusCode: isE ? error.statusCode : enums.StatusCode.internalServerError,
        errorMessage: isE ? error.message : "something happens unexpectedly.",
        documentUrl: documentUrl,
    };

    if (!isE) {
        baseResponse.actualErrorMessage = error.message;
    }

    if (settings.config.environment === settings.environment.developmentEnvironment) {
        baseResponse.stack = error.stack;
    }

    response.status(200).json(baseResponse);
}
