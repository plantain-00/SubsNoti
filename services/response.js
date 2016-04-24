"use strict";
const types = require("../share/types");
const settings = require("../settings");
const services = require("../services");
function sendSuccess(response, statusCode, result) {
    if (!result) {
        result = {};
    }
    const baseResponse = {
        isSuccess: true,
        statusCode: statusCode,
    };
    response.status(200 /* OK */).json(Object.assign(baseResponse, result));
}
exports.sendSuccess = sendSuccess;
function sendError(response, error, documentUrl) {
    const isE = error.statusCode;
    const baseResponse = {
        isSuccess: false,
        statusCode: isE ? error.statusCode : 500 /* internalServerError */,
        errorMessage: isE ? error.message : "something happens unexpectedly.",
        documentUrl: settings.documentServer + (documentUrl ? documentUrl : response.documentUrl),
    };
    if (!isE) {
        baseResponse.actualErrorMessage = error.message;
    }
    if (settings.currentEnvironment !== types.environment.production) {
        baseResponse.stack = error.stack;
    }
    services.logger.logError(error);
    response.status(200 /* OK */).json(baseResponse);
}
exports.sendError = sendError;
