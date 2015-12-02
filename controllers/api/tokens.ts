"use strict";

import * as types from "../../types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
    url: "/api/tokens",
    method: "post",
    documentUrl: "/api/authentication/send token via email.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    if (!libs.validator.isEmail(request.body.email)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("email"));
        return;
    }

    let email = libs.validator.trim(request.body.email).toLowerCase();
    let name = libs.validator.trim(request.body.name);

    try {
        let code = libs.validator.trim(request.body.code);
        let guid = libs.validator.trim(request.body.guid);
        if (code === "" || guid === "") {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("code or guid"));
            return;
        }

        await services.captcha.validate(guid, code);

        let token = await services.tokens.create(email, documentOfCreate.url, request, name);

        let url = `${settings.getApi()}${settings.urls.login}?authentication_credential=${token}`;

        if (settings.currentEnvironment === types.environment.test) {
            services.response.sendSuccess(response, types.StatusCode.createdOrModified, {
                url: url
            });
        } else {
            await services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);

            services.response.sendSuccess(response, types.StatusCode.createdOrModified);
        }
    } catch (error) {
        services.response.sendError(response, error);
    }
}
