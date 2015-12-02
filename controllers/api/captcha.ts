"use strict";

import * as types from "../../types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
    url: "/api/captchas",
    method: "post",
    documentUrl: "/api/authentication/create an captcha.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    try {
        let id = libs.validator.trim(request.body.id);

        if (id === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("id"));
            return;
        }

        let captcha = await services.captcha.create(id);

        services.response.sendSuccess(response, types.StatusCode.createdOrModified, {
            url: captcha.url,
            code: settings.currentEnvironment === types.environment.test ? captcha.code : undefined,
        });
    } catch (error) {
        services.response.sendError(response, error);
    }
}
