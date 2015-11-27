"use strict";

import * as types from "../../../common/types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/version",
    method: "get",
    documentUrl: "/api/version.html",
};

export function get(request: libs.Request, response: libs.Response) {
    services.response.sendSuccess(response, types.StatusCode.OK, {
        version: settings.version
    });
}
