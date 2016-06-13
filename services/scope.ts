import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export const documentOfGet: types.Document = {
    url: "/api/scopes",
    method: types.httpMethod.get,
    documentUrl: "/api/access token/get scopes.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    const result: types.ScopesResult = {
        scopes: services.settings.scopes,
    };
    services.response.sendSuccess(response);
}

export function shouldValidateAndContainScope(request: libs.Request, scopeName: types.ScopeName) {
    services.utils.assert(request.userId && contain(request, scopeName), services.error.unauthorized);
}

export function contain(request: libs.Request, scopeName: types.ScopeName) {
    return !request.scopes || request.scopes.indexOf(scopeName) >= 0;
}
