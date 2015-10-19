'use strict';

import * as libs from "../../../libs";
import * as settings from "../../../settings";

import * as enums from "../../../../common/enums";
import * as interfaces from "../../../../common/interfaces";

import * as services from "../../../services";

export let documentOfWatch = {
    url: "/api/user/themes/:theme_id/watched",
    method: "post",
    documentUrl: "/doc/api/Watch a theme.html"
};

export async function watch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfWatch.documentUrl;

    let themeStringId: string = request.params.theme_id;

    if (!libs.validator.isMongoId(themeStringId)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"), documentUrl);
        return;
    }

    try {
        let themeId = new libs.ObjectId(themeStringId);

        let userId = await services.authenticationCredential.authenticate(request);

        let theme = await services.mongo.Theme.findOne({ _id: themeId }).populate("organization").exec();
        if (!theme) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"), documentUrl);
            return;
        }
        let organization = <services.mongo.OrganizationDocument>theme.organization;
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.toHexString() === userId.toHexString())) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage(), documentUrl);
            return;
        }

        if (!libs._.find(theme.watchers, (w: libs.ObjectId) => w.toHexString() === userId.toHexString())) {
            let user = await services.mongo.User.findOne({ _id: userId }).exec();
            user.watchedThemes.push(themeId);
            theme.watchers.push(userId);
            user.save();
            theme.save();
        }

        services.response.sendSuccess(response, enums.StatusCode.createdOrModified);
    }
    catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}

export let documentOfUnwatch = {
    url: "/api/user/themes/:theme_id/watched",
    method: "delete",
    documentUrl: "/doc/api/Unwatch a theme.html"
};

export async function unwatch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfUnwatch.documentUrl;

    try {
        if (!libs.validator.isMongoId(request.params.theme_id)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"), documentUrl);
            return;
        }

        let themeId = new libs.ObjectId(request.params.theme_id);

        let userId = await services.authenticationCredential.authenticate(request);

        let theme = await services.mongo.Theme.findOne({ _id: themeId }).populate("organization").exec();
        if (!theme) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"), documentUrl);
            return;
        }
        let organization = <services.mongo.OrganizationDocument>theme.organization;
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.toHexString() === userId.toHexString())) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage(), documentUrl);
            return;
        }

        if (libs._.find(theme.watchers, (w: libs.ObjectId) => w.toHexString() === userId.toHexString())) {
            let user = await services.mongo.User.findOne({ _id: userId }).exec();
            user.watchedThemes["pull"](themeId);
            theme.watchers["pull"](userId);
            user.save();
            theme.save();
        }

        services.response.sendSuccess(response, enums.StatusCode.deleted);

    }
    catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
