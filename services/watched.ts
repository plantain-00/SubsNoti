import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export const documentOfWatch: types.Document = {
    url: "/api/user/watched/:theme_id",
    method: types.httpMethod.put,
    documentUrl: "/api/theme/watch a theme.html",
};

export async function watch(request: libs.Request, response: libs.Response) {
    const {theme_id} = request.params;
    services.utils.assert(typeof theme_id === "string" && libs.validator.isMongoId(theme_id), services.error.parameterIsInvalid, "theme_id");

    const themeId = new libs.mongoose.Types.ObjectId(theme_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the theme should be available.
    const theme = await services.mongo.Theme.findOne({ _id: themeId })
        .populate("organization")
        .select("organization watchers")
        .exec();
    services.utils.assert(theme, services.error.parameterIsInvalid, "theme_id");

    // current user should be the member of the organization that the theme in, or the organization is public.
    const organization = theme.organization as services.mongo.OrganizationDocument;
    services.utils.assert(organization._id.equals(services.seed.publicOrganizationId) || organization.members.find((m: libs.mongoose.Types.ObjectId) => m.equals(request.userId!)), services.error.theOrganizationIsPrivate);

    // if current user already watched the theme, then do nothing.
    if (!theme.watchers.find((w: libs.mongoose.Types.ObjectId) => w.equals(request.userId!))) {
        const user = await services.mongo.User.findOne({ _id: request.userId })
            .select("watchedThemes")
            .exec();

        user.watchedThemes.push(themeId);
        theme.watchers.push(request.userId!);
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

    services.response.sendSuccess(response);
}

export const documentOfUnwatch: types.Document = {
    url: "/api/user/watched/:theme_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/theme/unwatch a theme.html",
};

export async function unwatch(request: libs.Request, response: libs.Response) {
    const {theme_id} = request.params;
    services.utils.assert(typeof theme_id === "string" && libs.validator.isMongoId(theme_id), services.error.parameterIsInvalid, "theme_id");

    const themeId = new libs.mongoose.Types.ObjectId(theme_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the theme should be available.
    const theme = await services.mongo.Theme.findOne({ _id: themeId })
        .populate("organization")
        .select("organization watchers")
        .exec();
    services.utils.assert(theme, services.error.parameterIsInvalid, "theme_id");

    // current user should be the member of the organization that the theme in, or the organization is public.
    const organization = theme.organization as services.mongo.OrganizationDocument;
    services.utils.assert(organization._id.equals(services.seed.publicOrganizationId) || organization.members.find((m: libs.mongoose.Types.ObjectId) => m.equals(request.userId!)), services.error.theOrganizationIsPrivate);

    // if current user already unwatched the theme, then do nothing.
    if (theme.watchers.find((w: libs.mongoose.Types.ObjectId) => w.equals(request.userId!))) {
        const user = await services.mongo.User.findOne({ _id: request.userId })
            .select("watchedThemes")
            .exec();

        (user.watchedThemes as services.mongo.MongooseArray<libs.mongoose.Types.ObjectId>).pull(themeId);
        (theme.watchers as services.mongo.MongooseArray<libs.mongoose.Types.ObjectId>).pull(request.userId!);
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

    services.response.sendSuccess(response);
}
