"use strict";

import * as types from "../../../../common/types";

import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfDelete: types.Document = {
    url: "/api/user/logged_in",
    method: "delete",
    documentUrl: "/api/authentication/log out.html",
};

export function deleteThis(request: libs.Request, response: libs.Response): void {
    response.clearCookie(settings.config.cookieKeys.authenticationCredential);

    services.response.sendSuccess(response, types.StatusCode.deleted);
}
