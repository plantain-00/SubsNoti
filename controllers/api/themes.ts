import * as types from "../../share/types";
import * as libs from "../../libs";
import * as services from "../../services";

export const documentOfCreate: types.Document = {
    url: "/api/themes",
    method: types.httpMethod.post,
    documentUrl: "/api/theme/create a theme.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    interface Body {
        organizationId: string;
        themeTitle: string;
        themeDetail: string;
        imageNames: string[];
    }

    const body: Body = request.body;
    libs.assert(typeof body.organizationId === "string" && libs.validator.isMongoId(body.organizationId), services.error.parameterIsInvalid, "organizationId");

    const organizationId = new libs.ObjectId(body.organizationId);

    const themeTitle = typeof body.themeTitle === "string" ? libs.validator.trim(body.themeTitle) : "";
    libs.assert(themeTitle !== "", services.error.parameterIsMissed, "themeTitle");

    const themeDetail = typeof body.themeDetail === "string" ? libs.validator.trim(body.themeDetail) : "";

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the organization should be public organization, or current user should join in it.
    const user = await services.mongo.User.findOne({ _id: request.userId })
        .exec();
    libs.assert(organizationId.equals(services.seed.publicOrganizationId) || user.joinedOrganizations.find((o: libs.ObjectId) => o.equals(organizationId)), services.error.theOrganizationIsPrivate);

    const organization = await services.mongo.Organization.findOne({ _id: organizationId })
        .select("themes")
        .exec();

    const theme = await services.mongo.Theme.create({
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

    const imageNames = body.imageNames;
    if (imageNames && imageNames.length && imageNames.length > 0 && themeDetail) {
        for (const imageName of imageNames) {
            if (themeDetail.indexOf(imageName) > -1) {
                const [incomingMessage, json] = await services.request.request({
                    url: `${services.settings.imageUploader}/api/persistence`,
                    method: types.httpMethod.post,
                    form: {
                        name: imageName,
                        newName: imageName,
                    },
                });
                libs.assert(incomingMessage.statusCode < 300, json);
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
    const newTheme: types.Theme = {
        id: theme._id.toHexString(),
        title: theme.title,
        detail: theme.detail,
        organizationId: organizationId.toHexString(),
        createTime: theme.createTime.toISOString(),
        updateTime: theme.updateTime ? theme.updateTime.toISOString() : undefined,
        status: services.themeStatus.getType(theme.status),
        creator,
        owners: [creator],
        watchers: [creator],
    };
    services.push.emitTheme(types.themePushEvents.themeCreated, newTheme);

    services.logger.logRequest(documentOfCreate.url, request);
    services.response.sendSuccess(response);
}

export const documentOfUpdate: types.Document = {
    url: "/api/themes/:theme_id",
    method: types.httpMethod.put,
    documentUrl: "/api/theme/update a theme.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    const params: { theme_id: string; } = request.params;
    libs.assert(typeof params.theme_id === "string" && libs.validator.isMongoId(params.theme_id), services.error.parameterIsInvalid, "theme_id");

    interface Body {
        title: string;
        detail: string;
        status: types.ThemeStatusType;
        imageNames: string[];
    }

    const body: Body = request.body;

    const title = typeof body.title === "string" ? libs.validator.trim(body.title) : "";
    const detail = typeof body.detail === "string" ? libs.validator.trim(body.detail) : "";
    let status: types.ThemeStatus = null;

    if (body.status === types.themeStatus.open) {
        status = types.ThemeStatus.open;
    }
    if (body.status === types.themeStatus.closed) {
        status = types.ThemeStatus.closed;
    }

    const id = new libs.ObjectId(params.theme_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the theme should be available.
    const theme = await services.mongo.Theme.findOne({ _id: id })
        .populate("creator owners watchers")
        .exec();
    libs.assert(theme, services.error.parameterIsInvalid, "theme_id");

    // current user should be one of the theme's owners.
    libs.assert(theme.owners.find((o: libs.ObjectId) => o.equals(request.userId)), services.error.theThemeIsNotOwnedByYou);

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
                const [incomingMessage, json] = await services.request.request({
                    url: `${services.settings.imageUploader}/api/persistence`,
                    method: types.httpMethod.post,
                    form: {
                        name: imageName,
                        newName: imageName,
                    },
                });
                libs.assert(incomingMessage.statusCode < 300, json);
            }
        }
    }

    // push the modified theme.
    const result = services.theme.convert(theme);
    services.push.emitTheme(types.themePushEvents.themeUpdated, result);

    services.logger.logRequest(documentOfUpdate.url, request);
    services.response.sendSuccess(response);
}
