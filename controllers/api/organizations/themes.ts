import * as types from "../../../types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/organizations/:organization_id/themes",
    method: "get",
    documentUrl: "/api/theme/get themes of an organization.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        interface Query {
            page: string;
            limit: string;
            q: string;
            isOpen: string;
            isClosed: string;
            order: string;
        }

        let params: { organization_id: string } = request.params;
        if (!libs.validator.isMongoId(request.params.organization_id)) {
            throw services.error.fromParameterIsInvalidMessage("organization_id");
        }

        let query: Query = request.query;

        let organizationId = new libs.ObjectId(params.organization_id);
        let page = libs.validator.isNumeric(query.page) ? libs.validator.toInt(query.page) : 1;
        let limit = libs.validator.isNumeric(query.limit) ? libs.validator.toInt(query.limit) : settings.defaultItemLimit;
        let q = libs.validator.trim(query.q);
        let isOpen = libs.validator.trim(query.isOpen) !== types.no;
        let isClosed = libs.validator.trim(query.isClosed) === types.yes;

        // the organization should be public organization, or current user should join in it.
        if (!organizationId.equals(services.seed.publicOrganizationId)) {
            // identify current user.
            if (!request.userId) {
                throw services.error.fromUnauthorized();
            }

            let user = await services.mongo.User.findOne({ _id: request.userId })
                .select("joinedOrganizations")
                .exec();

            if (!libs._.find(user.joinedOrganizations, (o: libs.ObjectId) => o.equals(organizationId))) {
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

        let order = libs.validator.trim(query.order);
        let sort = order === types.themeOrder.recentlyUpdated ? { updateTime: -1 } : { createTime: -1 };

        let themes = await themesQuery.skip((page - 1) * limit)
            .limit(limit)
            .sort(sort)
            .populate("creator owners watchers")
            .exec();

        let totalCount: any = await countQuery.count()
            .exec();

        let result: types.ThemeResult = {
            themes: [],
            totalCount: <number>totalCount,
        };

        libs._.each(themes, (theme: services.mongo.ThemeDocument) => {
            result.themes.push(services.theme.convert(theme));
        });

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
