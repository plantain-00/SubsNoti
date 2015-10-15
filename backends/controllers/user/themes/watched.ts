'use strict';

import * as libs from "../../../libs";
import * as settings from "../../../settings";

import * as enums from "../../../../common/enums";
import * as interfaces from "../../../../common/interfaces";

import * as services from "../../../services";

let documentOfWatch = {
    url: "/api/user/themes/:theme_id/watched",
    method: "post",
    documentUrl: "/doc/api/Watch a theme.html"
};

export async function watch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfWatch.documentUrl;

    let themeStringId: string = request.params.theme_id;

    if (!themeStringId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    let themeId = new libs.ObjectId(themeStringId);

    try {
        let userId = await services.authenticationCredential.authenticate(request);

        let theme = await services.mongo.Theme.findOne({ _id: themeId }).populate("organization").exec();
        if (!theme) {
            services.response.sendInvalidParameterError(response, documentUrl);
            return;
        }
        let organization = <services.mongo.OrganizationDocument>theme.organization;
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.toHexString() === userId.toHexString())) {
            services.response.sendUnauthorizedError(response, "you are not in the organization where the theme belong to", documentUrl);
            return;
        }

        if (!libs._.find(theme.watchers, (w: libs.ObjectId) => w.toHexString() === userId.toHexString())) {
            let user = await services.mongo.User.findOne({ _id: userId }).exec();
            user.watchedThemes.push(themeId);
            theme.watchers.push(userId);
            user.save();
            theme.save();
        }

        services.response.sendCreatedOrModified(response, documentUrl);
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

let documentOfUnwatch = {
    url: "/api/user/themes/:theme_id/watched",
    method: "delete",
    documentUrl: "/doc/api/Unwatch a theme.html"
};

export async function unwatch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfUnwatch.documentUrl;

    let themeStringId: string = request.params.theme_id;

    if (!themeStringId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    let themeId = new libs.ObjectId(themeStringId);

    try {
        let userId = await services.authenticationCredential.authenticate(request);

        let theme = await services.mongo.Theme.findOne({ _id: themeId }).populate("organization").exec();
        if (!theme) {
            services.response.sendInvalidParameterError(response, documentUrl);
            return;
        }
        let organization = <services.mongo.OrganizationDocument>theme.organization;
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.toHexString() === userId.toHexString())) {
            services.response.sendUnauthorizedError(response, "you are not in the organization where the theme belong to", documentUrl);
            return;
        }

        if (libs._.find(theme.watchers, (w: libs.ObjectId) => w.toHexString() === userId.toHexString())) {
            let user = await services.mongo.User.findOne({ _id: userId }).exec();
            user.watchedThemes["pull"](themeId);
            theme.watchers["pull"](userId);
            user.save();
            theme.save();
        }

        services.response.sendDeleted(response, documentUrl);

    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

export function route(app: libs.Application) {
    app[documentOfUnwatch.method](documentOfUnwatch.url, unwatch);
    services.response.notGet(app, documentOfUnwatch);

    app[documentOfWatch.method](documentOfWatch.url, watch);
    services.response.notGet(app, documentOfWatch);
}
