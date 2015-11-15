"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let documentOfCreate: types.Document = {
    url: "/api/themes",
    method: "post",
    documentUrl: "/doc/api/Create a theme.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    try {
        if (!libs.validator.isMongoId(request.body.organizationId)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("organizationId"), documentUrl);
            return;
        }

        let organizationId = new libs.ObjectId(request.body.organizationId);

        let themeTitle = libs.validator.trim(request.body.themeTitle);
        if (themeTitle === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("themeTitle"), documentUrl);
            return;
        }

        let themeDetail = libs.validator.trim(request.body.themeDetail);

        let userId = await services.authenticationCredential.authenticate(request);

        // the organization should be public organization, or current user should join in it.
        let user = await services.mongo.User.findOne({ _id: userId })
            .select("joinedOrganizations createdThemes ownedThemes watchedThemes")
            .exec();
        if (!organizationId.equals(services.seed.publicOrganizationId)
            && !libs._.find(user.joinedOrganizations, (o: libs.ObjectId) => o.equals(organizationId))) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage(), documentUrl);
            return;
        }

        let organization = await services.mongo.Organization.findOne({ _id: organizationId })
            .select("themes")
            .exec();

        let theme = await services.mongo.Theme.create({
            title: themeTitle,
            detail: themeDetail,
            status: types.ThemeStatus.open,
            createTime: new Date(),
            updateTime: new Date(),
            creator: userId,
            owners: [userId],
            watchers: [userId],
            organization: organizationId,
        });

        user.createdThemes.push(theme._id);
        user.ownedThemes.push(theme._id);
        user.watchedThemes.push(theme._id);
        organization.themes.push(theme._id);

        user.save();
        organization.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}

export let documentOfUpdate: types.Document = {
    url: "/api/themes/:theme_id",
    method: "put",
    documentUrl: "/doc/api/Update a theme.html",
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
        let status: types.ThemeStatus = null;

        if (libs.validator.isIn(request.body.status, [types.ThemeStatus.open, types.ThemeStatus.closed])) {
            status = libs.validator.toInt(request.body.status);
        }

        let id = new libs.ObjectId(request.params.theme_id);

        let userId = await services.authenticationCredential.authenticate(request);

        // the theme should be available.
        let theme = await services.mongo.Theme.findOne({ _id: id })
            .select("title detail status owners")
            .exec();
        if (!theme) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"), documentUrl);
            return;
        }

        // current user should be one of the theme's owners.
        if (!libs._.find(theme.owners, (o: libs.ObjectId) => o.equals(userId))) {
            services.response.sendError(response, services.error.fromThemeIsNotYoursMessage(), documentUrl);
            return;
        }

        if (title) {
            theme.title = title;
        }

        if (detail) {
            theme.detail = detail;
        }

        if (status !== null) {
            theme.status = status;
        }

        theme.save();

        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
