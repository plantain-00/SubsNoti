"use strict";

import * as types from "../../../common/types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/organizations/:organization_id/themes",
    method: "get",
    documentUrl: "/doc/api/Get themes of an organization.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        if (!libs.validator.isMongoId(request.params.organization_id)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("organization_id"), documentUrl);
            return;
        }

        let organizationId = new libs.ObjectId(request.params.organization_id);
        let page = libs.validator.isNumeric(request.query.page) ? libs.validator.toInt(request.query.page) : 1;
        let limit = libs.validator.isNumeric(request.query.limit) ? libs.validator.toInt(request.query.limit) : settings.config.defaultItemLimit;
        let q = libs.validator.trim(request.query.q);
        let isOpen = libs.validator.trim(request.query.isOpen) !== "false";
        let isClosed = libs.validator.trim(request.query.isClosed) === "true";

        // the organization should be public organization, or current user should join in it.
        if (!organizationId.equals(services.seed.publicOrganizationId)) {
            // identify current user.
            let userId = await services.authenticationCredential.authenticate(request);

            let user = await services.mongo.User.findOne({ _id: userId })
                .select("joinedOrganizations")
                .exec();

            if (!libs._.find(user.joinedOrganizations, (o: libs.ObjectId) => o.equals(organizationId))) {
                services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage(), documentUrl);
                return;
            }
        }

        let query = services.mongo.Theme.find({
            organization: organizationId
        });
        let countQuery = services.mongo.Theme.find({
            organization: organizationId
        });

        if (isOpen && !isClosed) {
            query = query.where("status").equals(types.ThemeStatus.open);
            countQuery = countQuery.where("status").equals(types.ThemeStatus.open);
        } else if (!isOpen && isClosed) {
            query = query.where("status").equals(types.ThemeStatus.closed);
            countQuery = countQuery.where("status").equals(types.ThemeStatus.closed);
        }

        // filtered by `title` or `detail`.
        if (q) {
            query = query.or([{ title: new RegExp(q, "i") }, { detail: new RegExp(q, "i") }]);
            countQuery = countQuery.or([{ title: new RegExp(q, "i") }, { detail: new RegExp(q, "i") }]);
        }

        let sort;
        if (libs.semver.satisfies(request.v, ">=0.10.0") || libs.moment().isAfter(libs.moment("2015-11-22"))) {
            let order = libs.validator.trim(request.query.order);
            sort = order === types.themeOrder.recentlyUpdated ? { updateTime: -1 } : { createTime: -1 };
        } else {
            let order = libs.validator.isNumeric(request.query.order) ? libs.validator.toInt(request.query.order) : 0;
            sort = order === 1 ? { updateTime: -1 } : { createTime: -1 };
        }

        let themes = await query.skip((page - 1) * limit)
            .limit(limit)
            .sort(sort)
            .populate("creator owners watchers")
            .exec();

        let totalCount = await countQuery.count()
            .exec();

        let result = {
            themes: [],
            totalCount: totalCount,
        };

        libs._.each(themes, (t: services.mongo.ThemeDocument) => {
            let creator = <services.mongo.UserDocument>t.creator;

            let creatorId = creator._id.toHexString();

            let theme: types.Theme = {
                id: t._id.toHexString(),
                title: t.title,
                detail: t.detail,
                organizationId: organizationId.toHexString(),
                createTime: libs.semver.satisfies(request.v, ">=0.10.2") || libs.moment().isAfter(libs.moment("2015-11-22")) ? t.createTime.toISOString() : t.createTime.getTime(),
                updateTime: t.updateTime ? (libs.semver.satisfies(request.v, ">=0.10.2") || libs.moment().isAfter(libs.moment("2015-11-22"))? t.updateTime.toISOString() : t.updateTime.getTime()) : undefined,
                status: libs.semver.satisfies(request.v, ">=0.10.1") || libs.moment().isAfter(libs.moment("2015-11-22")) ? services.themeStatus.getType(t.status) : t.status,
                creator: {
                    id: creatorId,
                    name: creator.name,
                    email: creator.email,
                    avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
                },
                owners: libs._.map(<services.mongo.UserDocument[]>t.owners, o => {
                    let id = o._id.toHexString();
                    return {
                        id: id,
                        name: o.name,
                        email: o.email,
                        avatar: o.avatar || services.avatar.getDefaultName(id),
                    };
                }),
                watchers: libs._.map(<services.mongo.UserDocument[]>t.watchers, w => {
                    let id = w._id.toHexString();
                    return {
                        id: id,
                        name: w.name,
                        email: w.email,
                        avatar: w.avatar || services.avatar.getDefaultName(id),
                    };
                }),
            };

            result.themes.push(theme);
        });

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
