"use strict";

import * as types from "../../types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
    url: "/api/themes",
    method: "post",
    documentUrl: "/api/theme/create a theme.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    try {
        interface Body {
            organizationId: string;
            themeTitle: string;
            themeDetail: string;
        }

        let body: Body = request.body;

        if (!libs.validator.isMongoId(body.organizationId)) {
            throw services.error.fromParameterIsInvalidMessage("organizationId");
        }

        let organizationId = new libs.ObjectId(body.organizationId);

        let themeTitle = libs.validator.trim(body.themeTitle);
        if (themeTitle === "") {
            throw services.error.fromParameterIsMissedMessage("themeTitle");
        }

        let themeDetail = libs.validator.trim(body.themeDetail);

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }
        // the organization should be public organization, or current user should join in it.
        let user = await services.mongo.User.findOne({ _id: request.userId })
            .exec();
        if (!organizationId.equals(services.seed.publicOrganizationId)
            && !libs._.find(user.joinedOrganizations, (o: libs.ObjectId) => o.equals(organizationId))) {
            throw services.error.fromOrganizationIsPrivateMessage();
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
            creator: request.userId,
            owners: [request.userId],
            watchers: [request.userId],
            organization: organizationId,
        });

        user.createdThemes.push(theme._id);
        user.ownedThemes.push(theme._id);
        user.watchedThemes.push(theme._id);
        organization.themes.push(theme._id);

        user.save();
        organization.save();

        // push the new theme.
        let creatorId = user._id.toHexString();
        let creator = {
            id: creatorId,
            name: user.name,
            email: user.email,
            avatar: user.avatar || services.avatar.getDefaultName(creatorId),
        };
        let newTheme: types.Theme = {
            id: theme._id.toHexString(),
            title: theme.title,
            detail: theme.detail,
            organizationId: organizationId.toHexString(),
            createTime: theme.createTime.toISOString(),
            updateTime: theme.updateTime ? theme.updateTime.toISOString() : undefined,
            status: services.themeStatus.getType(theme.status),
            creator: creator,
            owners: [creator],
            watchers: [creator],
        };
        services.push.emit(types.pushEvents.themeCreated, newTheme);

        services.logger.log(documentOfCreate.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfUpdate: types.Document = {
    url: "/api/themes/:theme_id",
    method: "put",
    documentUrl: "/api/theme/update a theme.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    try {
        let params: { theme_id: string; } = request.params;

        if (!libs.validator.isMongoId(params.theme_id)) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }

        interface Body {
            title: string;
            detail: string;
            status: types.ThemeStatusType;
        }

        let body: Body = request.body;

        let title = libs.validator.trim(body.title);
        let detail = libs.validator.trim(body.detail);
        let status: types.ThemeStatus = null;

        if (body.status === types.themeStatus.open) {
            status = types.ThemeStatus.open;
        }
        if (body.status === types.themeStatus.closed) {
            status = types.ThemeStatus.closed;
        }

        let id = new libs.ObjectId(params.theme_id);

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        // the theme should be available.
        let theme = await services.mongo.Theme.findOne({ _id: id })
            .populate("creator owners watchers")
            .exec();
        if (!theme) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }

        // current user should be one of the theme's owners.
        if (!libs._.find(theme.owners, (o: libs.ObjectId) => o.equals(request.userId))) {
            throw services.error.fromThemeIsNotYoursMessage();
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

        // push the modified theme.
        let result = services.theme.convert(theme);
        services.push.emit(types.pushEvents.themeUpdated, result);

        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
