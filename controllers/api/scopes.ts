import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/scopes",
    method: types.httpMethod.get,
    documentUrl: "/api/access token/get scopes.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    let result: types.ScopesResult = {
        scopes: settings.scopes
    };
    services.response.sendSuccess(response, types.StatusCode.OK, result);
}
