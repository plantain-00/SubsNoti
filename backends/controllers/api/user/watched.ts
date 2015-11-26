"use strict";

import * as types from "../../../../common/types";

import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfWatch: types.Document = {
    url: "/api/user/watched/:theme_id",
    method: "put",
    documentUrl: "/doc/api/Watch a theme.html",
};

export async function watch(request: libs.Request, response: libs.Response) {
    if (!libs.validator.isMongoId(request.params.theme_id)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"));
        return;
    }

    try {
        let themeId = new libs.ObjectId(request.params.theme_id);

        let userId = request.userId;
        if (!userId) {
            services.response.sendError(response, services.error.fromUnauthorized());
            return;
        }

        // the theme should be available.
        let theme = await services.mongo.Theme.findOne({ _id: themeId })
            .populate("organization")
            .select("organization watchers")
            .exec();
        if (!theme) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"));
            return;
        }

        // current user should be the member of the organization that the theme in, or the organization is public.
        let organization = <services.mongo.OrganizationDocument>theme.organization;
        if (!organization._id.equals(services.seed.publicOrganizationId)
            && !libs._.find(organization.members, (m: libs.ObjectId) => m.equals(userId))) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage());
            return;
        }

        // if current user already watched the theme, then do nothing.
        if (!libs._.find(theme.watchers, (w: libs.ObjectId) => w.equals(userId))) {
            let user = await services.mongo.User.findOne({ _id: userId })
                .select("watchedThemes")
                .exec();

            user.watchedThemes.push(themeId);
            theme.watchers.push(userId);
            theme.updateTime = new Date();

            user.save();
            theme.save();

            // push the modified theme.
            theme = await services.mongo.Theme.findOne({ _id: themeId })
                .populate("creator owners watchers")
                .exec();
            let result = services.theme.convert(theme);
            services.push.emit(types.pushEvents.themeUpdated, result);
        }

        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfUnwatch: types.Document = {
    url: "/api/user/watched/:theme_id",
    method: "delete",
    documentUrl: "/doc/api/Unwatch a theme.html",
};

export async function unwatch(request: libs.Request, response: libs.Response) {
    if (!libs.validator.isMongoId(request.params.theme_id)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"));
        return;
    }

    try {
        let themeId = new libs.ObjectId(request.params.theme_id);

        let userId = request.userId;
        if (!userId) {
            services.response.sendError(response, services.error.fromUnauthorized());
            return;
        }

        // the theme should be available.
        let theme = await services.mongo.Theme.findOne({ _id: themeId })
            .populate("organization")
            .select("organization watchers")
            .exec();
        if (!theme) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("theme_id"));
            return;
        }

        // current user should be the member of the organization that the theme in, or the organization is public.
        let organization = <services.mongo.OrganizationDocument>theme.organization;
        if (!organization._id.equals(services.seed.publicOrganizationId)
            && !libs._.find(organization.members, (m: libs.ObjectId) => m.equals(userId))) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage());
            return;
        }

        // if current user already unwatched the theme, then do nothing.
        if (libs._.find(theme.watchers, (w: libs.ObjectId) => w.equals(userId))) {
            let user = await services.mongo.User.findOne({ _id: userId })
                .select("watchedThemes")
                .exec();

            (<services.mongo.MongooseArray<libs.ObjectId>>user.watchedThemes).pull(themeId);
            (<services.mongo.MongooseArray<libs.ObjectId>>theme.watchers).pull(userId);
            theme.updateTime = new Date();

            user.save();
            theme.save();

            // push the modified theme.
            theme = await services.mongo.Theme.findOne({ _id: themeId })
                .populate("creator owners watchers")
                .exec();
            let result = services.theme.convert(theme);
            services.push.emit(types.pushEvents.themeUpdated, result);
        }

        services.response.sendSuccess(response, types.StatusCode.deleted);

    } catch (error) {
        services.response.sendError(response, error);
    }
}
