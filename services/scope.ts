import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function shouldValidateAndContainScope(request: libs.Request, scopeName: types.ScopeName) {
    if (!request.userId) {
        throw services.error.unauthorized;
    }

    if (!contain(request, scopeName)) {
        throw services.error.unauthorized;
    }
}

export function contain(request: libs.Request, scopeName: types.ScopeName) {
    return !request.scopes || request.scopes.indexOf(scopeName) >= 0;
}
