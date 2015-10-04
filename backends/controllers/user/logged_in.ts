import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../../common/enums";
import * as interfaces from "../../../common/interfaces";

import * as services from "../../services";

let documentOfGet: interfaces.ApiDocument = {
    url: settings.config.urls.login,
    method: "get",
    documentUrl: "/doc/api/Log in.html"
};

export function get(request: libs.Request, response: libs.Response) {
    let authenticationCredential = request.query.authentication_credential;

    if (!authenticationCredential) {
        response.redirect("/index.html");
        return;
    }

    response.cookie(services.cookieKey.authenticationCredential, authenticationCredential, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true
    });

    response.redirect("/index.html?clear_previous_status=√");
}

let documentOfDelete: interfaces.ApiDocument = {
    url: "/api/user/logged_in",
    method: "delete",
    documentUrl: "/doc/api/Log out.html"
};

export function deleteThis(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfDelete.documentUrl;

    response.clearCookie(services.cookieKey.authenticationCredential);

    services.response.sendOK(response, documentUrl);
}

export function route(app: libs.Application) {
    app[documentOfDelete.method](documentOfDelete.url, deleteThis);

    app[documentOfGet.method](documentOfGet.url, get);
}