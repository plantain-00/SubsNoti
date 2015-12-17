import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function shouldValidateAndContainScope(request: libs.Request, scopeName: types.ScopeName) {
    if (!request.userId) {
        throw services.error.fromUnauthorized();
    }

    if (!contain(request, scopeName)) {
        throw services.error.fromUnauthorized();
    }
}

export function contain(request: libs.Request, scopeName: types.ScopeName) {
    return !request.scopes || request.scopes.indexOf(scopeName) >= 0;
}
