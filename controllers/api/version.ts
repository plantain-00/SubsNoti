import * as types from "../../types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: settings.urls.version,
    method: "get",
    documentUrl: "/api/version.html",
};

export function get(request: libs.Request, response: libs.Response) {
    let result: types.VersionResult = {
        version: settings.version
    };

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}
