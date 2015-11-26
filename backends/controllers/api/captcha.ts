"use strict";

import * as types from "../../../common/types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
    url: "/api/captchas",
    method: "post",
    documentUrl: "/doc/api/Create an captcha.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    try {
        let id = libs.validator.trim(request.body.id);

        if (id === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("id"));
            return;
        }

        let url = await services.captcha.create(id);

        services.response.sendSuccess(response, types.StatusCode.createdOrModified, {
            url: url
        });
    } catch (error) {
        services.response.sendError(response, error);
    }
}
