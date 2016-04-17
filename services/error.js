"use strict";
const types = require("../share/types");
function fromError(error, statusCode) {
    if (error) {
        return {
            statusCode: statusCode,
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }
    return null;
}
exports.fromError = fromError;
function fromMessage(message, statusCode) {
    return fromError(new Error(message), statusCode);
}
exports.fromMessage = fromMessage;
function fromParameterIsMissedMessage(parameter) {
    return fromMessage(`the parameter '${parameter}' is missed.`, 400 /* invalidRequest */);
}
exports.fromParameterIsMissedMessage = fromParameterIsMissedMessage;
function fromParameterIsInvalidMessage(parameter) {
    return fromMessage(`the parameter '${parameter}' is invalid.`, 400 /* invalidRequest */);
}
exports.fromParameterIsInvalidMessage = fromParameterIsInvalidMessage;
function fromOrganizationIsPrivateMessage() {
    return fromMessage(`the organization is private and only available to its members.`, 401 /* unauthorized */);
}
exports.fromOrganizationIsPrivateMessage = fromOrganizationIsPrivateMessage;
function fromThemeIsNotYoursMessage() {
    return fromMessage(`the theme is not owned by you.`, 401 /* unauthorized */);
}
exports.fromThemeIsNotYoursMessage = fromThemeIsNotYoursMessage;
function fromUnauthorized() {
    return fromMessage("the authentication credential is missed, out of date or invalid, or the access token is missed, invalid or out of scope.", 401 /* unauthorized */);
}
exports.fromUnauthorized = fromUnauthorized;
function fromInvalidIP(ip) {
    return fromMessage(`your ip ${ip} in not in the white list.`, 403 /* forbidden */);
}
exports.fromInvalidIP = fromInvalidIP;
