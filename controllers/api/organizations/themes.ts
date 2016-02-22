import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

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

    if (typeof params.organization_id !== "string"
        || !libs.validator.isMongoId(params.organization_id)) {
        throw services.error.fromParameterIsInvalidMessage("organization_id");
    }

    const query: Query = request.query;

    const organizationId = new libs.ObjectId(params.organization_id);

    let page = 1;
    if (typeof query.page === "string"
        && libs.validator.isNumeric(query.page)) {
        page = libs.validator.toInt(query.page);
    }

    let limit = settings.defaultItemLimit;
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

        if (!user.joinedOrganizations.find((o: libs.ObjectId) => o.equals(organizationId))) {
            throw services.error.fromOrganizationIsPrivateMessage();
        }
    }

    let themesQuery = services.mongo.Theme.find({
        organization: organizationId
    });
    let countQuery = services.mongo.Theme.find({
        organization: organizationId
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

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}
