import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export const documentOfGet: types.Document = {
    url: settings.urls.version,
    method: types.httpMethod.get,
    documentUrl: "/api/version.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    const result: types.VersionResult = {
        version: settings.version
    };

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}
