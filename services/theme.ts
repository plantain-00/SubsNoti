import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export const documentOfGet: types.Document = {
    url: "/api/organizations/:organization_id/themes",
    method: types.httpMethod.get,
    documentUrl: "/api/theme/get themes of an organization.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    interface Query {
        page: string;
        limit: string;
        q: string;
        isOpen: string;
        isClosed: string;
        order: string;
    }

    const params: { organization_id: string } = request.params;
    services.utils.assert(typeof params.organization_id === "string" && libs.validator.isMongoId(params.organization_id), services.error.parameterIsInvalid, "organization_id");

    const query: Query = request.query;

    const organizationId = new libs.ObjectId(params.organization_id);

    let page = 1;
    if (typeof query.page === "string"
        && libs.validator.isNumeric(query.page)) {
        page = libs.validator.toInt(query.page);
    }

    let limit = 10;
    if (typeof query.limit === "string"
        && libs.validator.isNumeric(query.limit)) {
        limit = libs.validator.toInt(query.limit);
    }

    const q = typeof query.q === "string" ? libs.validator.trim(query.q) : "";
    const isOpen = query.isOpen !== types.no;
    const isClosed = query.isClosed === types.yes;

    // the organization should be public organization, or current user should join in it.
    if (!organizationId.equals(services.seed.publicOrganizationId)) {
        // identify current user.
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readTheme);

        const user = await services.mongo.User.findOne({ _id: request.userId })
            .select("joinedOrganizations")
            .exec();

        services.utils.assert(user.joinedOrganizations.find((o: libs.ObjectId) => o.equals(organizationId)), services.error.theOrganizationIsPrivate);
    }

    let themesQuery = services.mongo.Theme.find({
        organization: organizationId,
    });
    let countQuery = services.mongo.Theme.find({
        organization: organizationId,
    });

    if (isOpen && !isClosed) {
        themesQuery = themesQuery.where("status").equals(types.ThemeStatus.open);
        countQuery = countQuery.where("status").equals(types.ThemeStatus.open);
    } else if (!isOpen && isClosed) {
        themesQuery = themesQuery.where("status").equals(types.ThemeStatus.closed);
        countQuery = countQuery.where("status").equals(types.ThemeStatus.closed);
    }

    // filtered by `title` or `detail`.
    if (q) {
        themesQuery = themesQuery.or([{ title: new RegExp(q, "i") }, { detail: new RegExp(q, "i") }]);
        countQuery = countQuery.or([{ title: new RegExp(q, "i") }, { detail: new RegExp(q, "i") }]);
    }

    const order = typeof query.order === "string" ? libs.validator.trim(query.order) : "";
    const sort = order === types.themeOrder.recentlyUpdated ? { updateTime: -1 } : { createTime: -1 };

    const themes = await themesQuery.skip((page - 1) * limit)
        .limit(limit)
        .sort(sort)
        .populate("creator owners watchers")
        .exec();

    const totalCount: any = await countQuery.count()
        .exec();

    const result: types.ThemesResult = {
        themes: [],
        totalCount: totalCount as number,
    };

    for (const theme of themes) {
        result.themes.push(services.theme.convert(theme));
    }

    services.response.sendSuccess(response, result);
}

export function convert(theme: services.mongo.ThemeDocument): types.Theme {
    const creator = theme.creator as services.mongo.UserDocument;
    const creatorId = creator._id.toHexString();
    const result: types.Theme = {
        id: theme._id.toHexString(),
        title: theme.title,
        detail: theme.detail,
        organizationId: (theme.organization as libs.ObjectId).toHexString(),
        createTime: theme.createTime.toISOString(),
        updateTime: theme.updateTime ? theme.updateTime.toISOString() : undefined,
        status: services.themeStatus.getType(theme.status),
        creator: {
            id: creatorId,
            name: creator.name,
            email: creator.email,
            avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
        },
        owners: (theme.owners as services.mongo.UserDocument[]).map(o => {
            const id = o._id.toHexString();
            return {
                id: id,
                name: o.name,
                email: o.email,
                avatar: o.avatar || services.avatar.getDefaultName(id),
            };
        }),
        watchers: (theme.watchers as services.mongo.UserDocument[]).map(w => {
            const id = w._id.toHexString();
            return {
                id: id,
                name: w.name,
                email: w.email,
                avatar: w.avatar || services.avatar.getDefaultName(id),
            };
        }),
    };

    return result;
}

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
    services.utils.assert(typeof body.organizationId === "string" && libs.validator.isMongoId(body.organizationId), services.error.parameterIsInvalid, "organizationId");

    const organizationId = new libs.ObjectId(body.organizationId);

    const themeTitle = typeof body.themeTitle === "string" ? libs.validator.trim(body.themeTitle) : "";
    services.utils.assert(themeTitle !== "", services.error.parameterIsMissed, "themeTitle");

    const themeDetail = typeof body.themeDetail === "string" ? libs.validator.trim(body.themeDetail) : "";

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeTheme);

    // the organization should be public organization, or current user should join in it.
    const user = await services.mongo.User.findOne({ _id: request.userId })
        .exec();
    services.utils.assert(organizationId.equals(services.seed.publicOrganizationId) || user.joinedOrganizations.find((o: libs.ObjectId) => o.equals(organizationId)), services.error.theOrganizationIsPrivate);

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
                services.utils.assert(incomingMessage.statusCode < 300, json);
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
    services.utils.assert(typeof params.theme_id === "string" && libs.validator.isMongoId(params.theme_id), services.error.parameterIsInvalid, "theme_id");

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
    services.utils.assert(theme, services.error.parameterIsInvalid, "theme_id");

    // current user should be one of the theme's owners.
    services.utils.assert(theme.owners.find((o: libs.ObjectId) => o.equals(request.userId)), services.error.theThemeIsNotOwnedByYou);

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
                services.utils.assert(incomingMessage.statusCode < 300, json);
            }
        }
    }

    // push the modified theme.
    const result = services.theme.convert(theme);
    services.push.emitTheme(types.themePushEvents.themeUpdated, result);

    services.logger.logRequest(documentOfUpdate.url, request);
    services.response.sendSuccess(response);
}
