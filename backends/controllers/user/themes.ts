'use strict';

import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../../common/enums";
import * as interfaces from "../../../common/interfaces";

import * as services from "../../services";

let documentOfCreate = {
    url: "/api/user/themes",
    method: "post",
    documentUrl: "/doc/api/Create a theme.html"
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    if (services.contentType.isInvalid(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    let organizationId: string = request.body.organizationId;

    if (!organizationId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    let organizationObjectId = new libs.ObjectId(organizationId);

    let themeTitle = request.body.themeTitle;
    if (!themeTitle) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    themeTitle = themeTitle.trim();
    if (!themeTitle) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    let themeDetail = request.body.themeDetail;

    try {
        let userId = await services.user.authenticate(request);
        let user = await services.mongo.User.findOne({ _id: userId }).exec();
        if (!libs._.include(user.joinedOrganizations, organizationObjectId)) {
            services.response.sendUnauthorizedError(response, "your are creating a theme for an organization that you are not in", documentUrl);
            return;
        }


        let organization = await services.mongo.Organization.findOne({ _id: organizationObjectId }).exec();

        let theme = await services.mongo.Theme.create({
            title: themeTitle,
            detail: themeDetail,
            status: enums.UserStatus.normal,
            createTime: new Date(),
            creator: userId,
            owners: [userId],
            watchers: [userId],
            organization: organizationObjectId
        });
        user.createdThemes.push(theme._id);
        user.ownedThemes.push(theme._id);
        user.watchedThemes.push(theme._id);
        organization.themes.push(theme._id);
        user.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendCreatedOrModified(response, documentUrl);
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}
