import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export const documentOfWatch: types.Document = {
    url: "/api/user/watched/:theme_id",
    method: types.httpMethod.put,
    documentUrl: "/api/theme/watch a theme.html",
};

interface Params {
    theme_id: string;
}

export async function watch(request: libs.Request, response: libs.Response) {
    const params: Params = request.params;

    if (!libs.validator.isMongoId(params.theme_id)) {
        throw services.error.fromParameterIsInvalidMessage("theme_id");
    }

    const themeId = new libs.ObjectId(params.theme_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the theme should be available.
    const theme = await services.mongo.Theme.findOne({ _id: themeId })
        .populate("organization")
        .select("organization watchers")
        .exec();
    if (!theme) {
        throw services.error.fromParameterIsInvalidMessage("theme_id");
    }

    // current user should be the member of the organization that the theme in, or the organization is public.
    const organization = theme.organization as services.mongo.OrganizationDocument;
    if (!organization._id.equals(services.seed.publicOrganizationId)
        && !organization.members.find((m: libs.ObjectId) => m.equals(request.userId))) {
        throw services.error.fromOrganizationIsPrivateMessage();
    }

    // if current user already watched the theme, then do nothing.
    if (!theme.watchers.find((w: libs.ObjectId) => w.equals(request.userId))) {
        const user = await services.mongo.User.findOne({ _id: request.userId })
            .select("watchedThemes")
            .exec();

        user.watchedThemes.push(themeId);
        theme.watchers.push(request.userId);
        theme.updateTime = new Date();

        user.save();
        theme.save();

        // push the modified theme.
        const newTheme = await services.mongo.Theme.findOne({ _id: themeId })
            .populate("creator owners watchers")
            .exec();
        const result = services.theme.convert(newTheme);
        services.push.emitTheme(types.themePushEvents.themeUpdated, result);
    }

    services.response.sendSuccess(response, types.StatusCode.createdOrModified);
}

export const documentOfUnwatch: types.Document = {
    url: "/api/user/watched/:theme_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/theme/unwatch a theme.html",
};

export async function unwatch(request: libs.Request, response: libs.Response) {
    const params: Params = request.params;

    if (!libs.validator.isMongoId(params.theme_id)) {
        throw services.error.fromParameterIsInvalidMessage("theme_id");
    }

    const themeId = new libs.ObjectId(params.theme_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the theme should be available.
    const theme = await services.mongo.Theme.findOne({ _id: themeId })
        .populate("organization")
        .select("organization watchers")
        .exec();
    if (!theme) {
        throw services.error.fromParameterIsInvalidMessage("theme_id");
    }

    // current user should be the member of the organization that the theme in, or the organization is public.
    const organization = theme.organization as services.mongo.OrganizationDocument;
    if (!organization._id.equals(services.seed.publicOrganizationId)
        && !organization.members.find((m: libs.ObjectId) => m.equals(request.userId))) {
        throw services.error.fromOrganizationIsPrivateMessage();
    }

    // if current user already unwatched the theme, then do nothing.
    if (theme.watchers.find((w: libs.ObjectId) => w.equals(request.userId))) {
        const user = await services.mongo.User.findOne({ _id: request.userId })
            .select("watchedThemes")
            .exec();

        (user.watchedThemes as services.mongo.MongooseArray<libs.ObjectId>).pull(themeId);
        (theme.watchers as services.mongo.MongooseArray<libs.ObjectId>).pull(request.userId);
        theme.updateTime = new Date();

        user.save();
        theme.save();

        // push the modified theme.
        const newTheme = await services.mongo.Theme.findOne({ _id: themeId })
            .populate("creator owners watchers")
            .exec();
        const result = services.theme.convert(newTheme);
        services.push.emitTheme(types.themePushEvents.themeUpdated, result);
    }

    services.response.sendSuccess(response, types.StatusCode.deleted);
}
