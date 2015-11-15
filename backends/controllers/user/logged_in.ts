"use strict";

import * as types from "../../../common/types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: settings.config.urls.login,
    method: "get",
    documentUrl: "/doc/api/Log in.html",
};

export function get(request: libs.Request, response: libs.Response) {
    let authenticationCredential = request.query.authentication_credential;

    if (!authenticationCredential) {
        response.redirect("/index.html");
        return;
    }

    response.cookie(settings.config.cookieKeys.authenticationCredential, authenticationCredential, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true,
    });

    response.redirect("/index.html?clear_previous_status=√");
}

export let documentOfDelete: types.Document = {
    url: "/api/user/logged_in",
    method: "delete",
    documentUrl: "/doc/api/Log out.html",
};

export function deleteThis(request: libs.Request, response: libs.Response): void {
    response.clearCookie(settings.config.cookieKeys.authenticationCredential);

    services.response.sendSuccess(response, types.StatusCode.deleted);
}
