'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let documentOfUpdate = {
    url: "/api/themes/:theme_id",
    method: "put",
    documentUrl: "/doc/api/Update a theme.html"
};

export async function update(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfUpdate.documentUrl;

    try {
        if (!libs.validator.isMongoId(request.params.theme_id)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"), documentUrl);
            return;
        }

        let title = libs.validator.trim(request.body.title);
        let detail = libs.validator.trim(request.body.detail);
        let themeStatus: enums.ThemeStatus;

        if (libs.validator.isIn(request.body.status, [enums.ThemeStatus.open, enums.ThemeStatus.closed])) {
            themeStatus = libs.validator.toInt(request.body.status);
        }

        let objectId = new libs.ObjectId(request.params.theme_id);

        let userId = await services.authenticationCredential.authenticate(request);
        let theme = await services.mongo.Theme.findOne({ _id: objectId }).select('title detail status').exec();
        if (!theme) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"), documentUrl);
            return;
        }

        if (title) {
            theme.title = title;
        }

        if (detail) {
            theme.detail = detail;
        }

        if (themeStatus) {
            theme.status = themeStatus;
        }

        theme.save();

        services.response.sendSuccess(response, enums.StatusCode.createdOrModified);
    }
    catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
