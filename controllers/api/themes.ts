import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
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

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the organization should be public organization, or current user should join in it.
    let user = await services.mongo.User.findOne({ _id: request.userId })
        .exec();
    if (!organizationId.equals(services.seed.publicOrganizationId)
        && !user.joinedOrganizations.find((o: libs.ObjectId) => o.equals(organizationId))) {
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

    let imageNames = body.imageNames;
    if (imageNames && imageNames.length && imageNames.length > 0 && themeDetail) {
        for (let imageName of imageNames) {
            if (themeDetail.indexOf(imageName) > -1) {
                let json = await services.request.postAsync(`${settings.imageUploader.get(settings.currentEnvironment)}/api/persistence`, {
                    name: imageName,
                    newName: imageName,
                });
                if (json.response.statusCode >= 300) {
                    throw services.error.fromMessage(JSON.stringify(json.body), types.StatusCode.internalServerError);
                }
            }
        }
    }

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
    services.push.emitTheme(types.themePushEvents.themeCreated, newTheme);

    services.logger.log(documentOfCreate.url, request);
    services.response.sendSuccess(response, types.StatusCode.createdOrModified);
}

export let documentOfUpdate: types.Document = {
    url: "/api/themes/:theme_id",
    method: types.httpMethod.put,
    documentUrl: "/api/theme/update a theme.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    let params: { theme_id: string; } = request.params;

    if (!libs.validator.isMongoId(params.theme_id)) {
        throw services.error.fromParameterIsInvalidMessage("theme_id");
    }

    interface Body {
        title: string;
        detail: string;
        status: types.ThemeStatusType;
        imageNames: string[];
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

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the theme should be available.
    let theme = await services.mongo.Theme.findOne({ _id: id })
        .populate("creator owners watchers")
        .exec();
    if (!theme) {
        throw services.error.fromParameterIsInvalidMessage("theme_id");
    }

    // current user should be one of the theme's owners.
    if (!theme.owners.find((o: libs.ObjectId) => o.equals(request.userId))) {
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

    let imageNames = body.imageNames;
    if (imageNames && imageNames.length && imageNames.length > 0 && detail) {
        for (let imageName of imageNames) {
            if (detail.indexOf(imageName) > -1) {
                let json = await services.request.postAsync(`${settings.imageUploader.get(settings.currentEnvironment)}/api/persistence`, {
                    name: imageName,
                    newName: imageName,
                });
                if (json.response.statusCode >= 300) {
                    throw services.error.fromMessage(JSON.stringify(json.body), types.StatusCode.internalServerError);
                }
            }
        }
    }

    // push the modified theme.
    let result = services.theme.convert(theme);
    services.push.emitTheme(types.themePushEvents.themeUpdated, result);

    services.logger.log(documentOfUpdate.url, request);
    services.response.sendSuccess(response, types.StatusCode.createdOrModified);
}
