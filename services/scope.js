"use strict";
const services = require("../services");
function shouldValidateAndContainScope(request, scopeName) {
    if (!request.userId) {
        throw services.error.fromUnauthorized();
    }
    if (!contain(request, scopeName)) {
        throw services.error.fromUnauthorized();
    }
}
exports.shouldValidateAndContainScope = shouldValidateAndContainScope;
function contain(request, scopeName) {
    return !request.scopes || request.scopes.indexOf(scopeName) >= 0;
}
exports.contain = contain;
