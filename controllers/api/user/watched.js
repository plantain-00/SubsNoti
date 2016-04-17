"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../../../share/types");
const libs = require("../../../libs");
const services = require("../../../services");
exports.documentOfWatch = {
    url: "/api/user/watched/:theme_id",
    method: types.httpMethod.put,
    documentUrl: "/api/theme/watch a theme.html",
};
function watch(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.theme_id !== "string"
            || !libs.validator.isMongoId(params.theme_id)) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }
        const themeId = new libs.ObjectId(params.theme_id);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);
        // the theme should be available.
        const theme = yield services.mongo.Theme.findOne({ _id: themeId })
            .populate("organization")
            .select("organization watchers")
            .exec();
        if (!theme) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }
        // current user should be the member of the organization that the theme in, or the organization is public.
        const organization = theme.organization;
        if (!organization._id.equals(services.seed.publicOrganizationId)
            && !organization.members.find((m) => m.equals(request.userId))) {
            throw services.error.fromOrganizationIsPrivateMessage();
        }
        // if current user already watched the theme, then do nothing.
        if (!theme.watchers.find((w) => w.equals(request.userId))) {
            const user = yield services.mongo.User.findOne({ _id: request.userId })
                .select("watchedThemes")
                .exec();
            user.watchedThemes.push(themeId);
            theme.watchers.push(request.userId);
            theme.updateTime = new Date();
            user.save();
            theme.save();
            // push the modified theme.
            const newTheme = yield services.mongo.Theme.findOne({ _id: themeId })
                .populate("creator owners watchers")
                .exec();
            const result = services.theme.convert(newTheme);
            services.push.emitTheme(types.themePushEvents.themeUpdated, result);
        }
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.watch = watch;
exports.documentOfUnwatch = {
    url: "/api/user/watched/:theme_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/theme/unwatch a theme.html",
};
function unwatch(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.theme_id !== "string"
            || !libs.validator.isMongoId(params.theme_id)) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }
        const themeId = new libs.ObjectId(params.theme_id);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);
        // the theme should be available.
        const theme = yield services.mongo.Theme.findOne({ _id: themeId })
            .populate("organization")
            .select("organization watchers")
            .exec();
        if (!theme) {
            throw services.error.fromParameterIsInvalidMessage("theme_id");
        }
        // current user should be the member of the organization that the theme in, or the organization is public.
        const organization = theme.organization;
        if (!organization._id.equals(services.seed.publicOrganizationId)
            && !organization.members.find((m) => m.equals(request.userId))) {
            throw services.error.fromOrganizationIsPrivateMessage();
        }
        // if current user already unwatched the theme, then do nothing.
        if (theme.watchers.find((w) => w.equals(request.userId))) {
            const user = yield services.mongo.User.findOne({ _id: request.userId })
                .select("watchedThemes")
                .exec();
            user.watchedThemes.pull(themeId);
            theme.watchers.pull(request.userId);
            theme.updateTime = new Date();
            user.save();
            theme.save();
            // push the modified theme.
            const newTheme = yield services.mongo.Theme.findOne({ _id: themeId })
                .populate("creator owners watchers")
                .exec();
            const result = services.theme.convert(newTheme);
            services.push.emitTheme(types.themePushEvents.themeUpdated, result);
        }
        services.response.sendSuccess(response, 204 /* deleted */);
    });
}
exports.unwatch = unwatch;
