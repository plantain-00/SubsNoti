"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../../share/types");
const libs = require("../../libs");
const settings = require("../../settings");
const services = require("../../services");
exports.documentOfCreate = {
    url: "/api/themes",
    method: types.httpMethod.post,
    documentUrl: "/api/theme/create a theme.html",
};
function create(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        if (typeof body.organizationId !== "string"
            || !libs.validator.isMongoId(body.organizationId)) {
            throw services.error.fromParameterIsInvalidMessage("organizationId");
        }
        const organizationId = new libs.ObjectId(body.organizationId);
        const themeTitle = typeof body.themeTitle === "string" ? libs.validator.trim(body.themeTitle) : "";
        if (themeTitle === "") {
            throw services.error.fromParameterIsMissedMessage("themeTitle");
        }
        const themeDetail = typeof body.themeDetail === "string" ? libs.validator.trim(body.themeDetail) : "";
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);
        // the organization should be public organization, or current user should join in it.
        const user = yield services.mongo.User.findOne({ _id: request.userId })
            .exec();
        if (!organizationId.equals(services.seed.publicOrganizationId)
            && !user.joinedOrganizations.find((o) => o.equals(organizationId))) {
            throw services.error.fromOrganizationIsPrivateMessage();
        }
        const organization = yield services.mongo.Organization.findOne({ _id: organizationId })
            .select("themes")
            .exec();
        const theme = yield services.mongo.Theme.create({
            title: themeTitle,
            detail: themeDetail,
            status: 0 /* open */,
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
        const imageNames = body.imageNames;
        if (imageNames && imageNames.length && imageNames.length > 0 && themeDetail) {
            for (const imageName of imageNames) {
                if (themeDetail.indexOf(imageName) > -1) {
                    const json = yield services.request.postAsync(`${settings.imageUploader}/api/persistence`, {
                        name: imageName,
                        newName: imageName,
                    });
                    if (json.response.statusCode >= 300) {
                        throw services.error.fromMessage(JSON.stringify(json.body), 500 /* internalServerError */);
                    }
                }
            }
        }
        // push the new theme.
        const creatorId = user._id.toHexString();
        const creator = {
            id: creatorId,
            name: user.name,
            email: user.email,
            avatar: user.avatar || services.avatar.getDefaultName(creatorId),
        };
        const newTheme = {
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
        services.push.emitTheme(types.themePushEvents.themeCreated, newTheme);
        services.logger.logRequest(exports.documentOfCreate.url, request);
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.create = create;
exports.documentOfUpdate = {
    url: "/api/themes/:theme_id",
    method: types.httpMethod.put,
    documentUrl: "/api/theme/update a theme.html",
};
function update(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.theme_id !== "string"
            || !libs.validator.isMongoId(params.theme_id)) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }
        const body = request.body;
        const title = typeof body.title === "string" ? libs.validator.trim(body.title) : "";
        const detail = typeof body.detail === "string" ? libs.validator.trim(body.detail) : "";
        let status = null;
        if (body.status === types.themeStatus.open) {
            status = 0 /* open */;
        }
        if (body.status === types.themeStatus.closed) {
            status = 1 /* closed */;
        }
        const id = new libs.ObjectId(params.theme_id);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);
        // the theme should be available.
        const theme = yield services.mongo.Theme.findOne({ _id: id })
            .populate("creator owners watchers")
            .exec();
        if (!theme) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }
        // current user should be one of the theme's owners.
        if (!theme.owners.find((o) => o.equals(request.userId))) {
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
        const imageNames = body.imageNames;
        if (imageNames && imageNames.length && imageNames.length > 0 && detail) {
            for (const imageName of imageNames) {
                if (detail.indexOf(imageName) > -1) {
                    const json = yield services.request.postAsync(`${settings.imageUploader}/api/persistence`, {
                        name: imageName,
                        newName: imageName,
                    });
                    if (json.response.statusCode >= 300) {
                        throw services.error.fromMessage(JSON.stringify(json.body), 500 /* internalServerError */);
                    }
                }
            }
        }
        // push the modified theme.
        const result = services.theme.convert(theme);
        services.push.emitTheme(types.themePushEvents.themeUpdated, result);
        services.logger.logRequest(exports.documentOfUpdate.url, request);
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.update = update;
