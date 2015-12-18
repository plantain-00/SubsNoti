import * as types from "../../types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/scopes",
    method: "get",
    documentUrl: "/api/access token/get scopes.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        let result: types.ScopesResult = {
            scopes: settings.scopes
        };
        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
