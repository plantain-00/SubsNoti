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
const settings = require("../../../settings");
const services = require("../../../services");
exports.documentOfGet = {
    url: "/api/organizations/:organization_id/themes",
    method: types.httpMethod.get,
    documentUrl: "/api/theme/get themes of an organization.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.organization_id !== "string"
            || !libs.validator.isMongoId(params.organization_id)) {
            throw services.error.fromParameterIsInvalidMessage("organization_id");
        }
        const query = request.query;
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
            const user = yield services.mongo.User.findOne({ _id: request.userId })
                .select("joinedOrganizations")
                .exec();
            if (!user.joinedOrganizations.find((o) => o.equals(organizationId))) {
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
            themesQuery = themesQuery.where("status").equals(0 /* open */);
            countQuery = countQuery.where("status").equals(0 /* open */);
        }
        else if (!isOpen && isClosed) {
            themesQuery = themesQuery.where("status").equals(1 /* closed */);
            countQuery = countQuery.where("status").equals(1 /* closed */);
        }
        // filtered by `title` or `detail`.
        if (q) {
            themesQuery = themesQuery.or([{ title: new RegExp(q, "i") }, { detail: new RegExp(q, "i") }]);
            countQuery = countQuery.or([{ title: new RegExp(q, "i") }, { detail: new RegExp(q, "i") }]);
        }
        const order = typeof query.order === "string" ? libs.validator.trim(query.order) : "";
        const sort = order === types.themeOrder.recentlyUpdated ? { updateTime: -1 } : { createTime: -1 };
        const themes = yield themesQuery.skip((page - 1) * limit)
            .limit(limit)
            .sort(sort)
            .populate("creator owners watchers")
            .exec();
        const totalCount = yield countQuery.count()
            .exec();
        const result = {
            themes: [],
            totalCount: totalCount,
        };
        for (const theme of themes) {
            result.themes.push(services.theme.convert(theme));
        }
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
