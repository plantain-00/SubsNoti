var enums = require("../enums/enums");
function send(response, errorMessage, errorCode, statusCode, documentUrl) {
    response.status(200).json({
        isSuccess: errorCode == 0 /* success */,
        statusCode: statusCode,
        errorCode: errorCode,
        errorMessage: errorMessage,
        documentUrl: documentUrl
    });
}
function sendContentTypeError(response, documentUrl) {
    send(response, "Content-Type is not application/json", 1 /* wrongContentType */, 400 /* invalidRequest */, documentUrl);
}
exports.sendContentTypeError = sendContentTypeError;
function sendParameterMissedError(response, documentUrl) {
    send(response, "parameter is missed", 2 /* parameterMissed */, 400 /* invalidRequest */, documentUrl);
}
exports.sendParameterMissedError = sendParameterMissedError;
function sendDBAccessError(response, errorMessage, documentUrl) {
    send(response, errorMessage, 4 /* dbAccessError */, 500 /* internalServerError */, documentUrl);
}
exports.sendDBAccessError = sendDBAccessError;
function sendCreatedOrModified(response, documentUrl) {
    send(response, "", 0 /* success */, 201 /* createdOrModified */, documentUrl);
}
exports.sendCreatedOrModified = sendCreatedOrModified;
function sendAccountInWrongStatusError(response, errorMessage, documentUrl) {
    send(response, errorMessage, 3 /* accountInWrongStatus */, 422 /* unprocessableEntity */, documentUrl);
}
exports.sendAccountInWrongStatusError = sendAccountInWrongStatusError;
function sendEmailServiceError(response, errorMessage, documentUrl) {
    send(response, errorMessage, 5 /* emailServiceError */, 500 /* internalServerError */, documentUrl);
}
exports.sendEmailServiceError = sendEmailServiceError;
function sendUnauthorizedError(response, errorMessage, documentUrl) {
    send(response, errorMessage, 6 /* unauthorizedError */, 401 /* unauthorized */, documentUrl);
}
exports.sendUnauthorizedError = sendUnauthorizedError;
function sendOK(response, documentUrl) {
    send(response, "", 0 /* success */, 200 /* OK */, documentUrl);
}
exports.sendOK = sendOK;
function sendWrongHttpMethod(response, documentUrl) {
    send(response, "current http method is not right for the api", 7 /* wrongHttpMethod */, 400 /* invalidRequest */, documentUrl);
}
exports.sendWrongHttpMethod = sendWrongHttpMethod;
//# sourceMappingURL=response.js.map