"use strict";

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let documentOfCreate = {
    url: "/api/captchas",
    method: "post",
    documentUrl: "/doc/api/Create an captcha.html",
};

export async function create(request: libs.Request, response: libs.Response): Promise<void> {
    let documentUrl = documentOfCreate.documentUrl;

    try {
        let id = libs.validator.trim(request.body.id);

        if (id === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("id"), documentUrl);
            return;
        }

        let url = await services.captcha.create(id);

        services.response.sendSuccess(response, enums.StatusCode.createdOrModified, {
            url: url
        });
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
