import * as types from "../../share/types";
import * as libs from "../../libs";
import * as services from "../../services";

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
