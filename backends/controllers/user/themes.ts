'use strict';

import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../../common/enums";
import * as interfaces from "../../../common/interfaces";

import * as services from "../../services";

export let documentOfCreate = {
    url: "/api/user/themes",
    method: "post",
    documentUrl: "/doc/api/Create a theme.html"
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    let organizationStringId: string = request.body.organizationId;

    if (!organizationStringId) {
        services.response.sendError(response, services.error.fromParameterIsMissedMessage("organizationId"), documentUrl);
        return;
    }

    let organizationId = new libs.ObjectId(organizationStringId);

    let themeTitle = request.body.themeTitle;
    if (!themeTitle) {
        services.response.sendError(response, services.error.fromParameterIsMissedMessage("themeTitle"), documentUrl);
        return;
    }

    themeTitle = themeTitle.trim();
    if (!themeTitle) {
        services.response.sendError(response, services.error.fromParameterIsMissedMessage("themeTitle"), documentUrl);
        return;
    }

    let themeDetail = request.body.themeDetail;

    try {
        let userId = await services.authenticationCredential.authenticate(request);
        let user = await services.mongo.User.findOne({ _id: userId }).exec();
        if (!libs._.find(user.joinedOrganizations, (o: libs.ObjectId) => organizationStringId)) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage(), documentUrl);
            return;
        }


        let organization = await services.mongo.Organization.findOne({ _id: organizationId }).exec();

        let theme = await services.mongo.Theme.create({
            title: themeTitle,
            detail: themeDetail,
            status: enums.UserStatus.normal,
            createTime: new Date(),
            creator: userId,
            owners: [userId],
            watchers: [userId],
            organization: organizationId
        });
        user.createdThemes.push(theme._id);
        user.ownedThemes.push(theme._id);
        user.watchedThemes.push(theme._id);
        organization.themes.push(theme._id);
        user.save();
        organization.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendSuccess(response, enums.StatusCode.createdOrModified);
    }
    catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
