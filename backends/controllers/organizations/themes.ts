'use strict';

import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../../common/enums";
import * as interfaces from "../../../common/interfaces";

import * as services from "../../services";

export let documentOfGet = {
    url: "/api/organizations/:organization_id/themes",
    method: "get",
    documentUrl: "/doc/api/Get themes of an organization.html"
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let organizationStringId: string = request.params.organization_id;
        let organizationId = new libs.ObjectId(organizationStringId);
        let page = request.query.page;
        if (!page) {
            page = 1;
        }
        let limit = request.query.limit;
        if (!limit) {
            limit = settings.config.defaultItemLimit;
        }

        let userId = await services.authenticationCredential.authenticate(request);
        let user = await services.mongo.User.findOne({ _id: userId }).exec();

        if (!libs._.find(user.joinedOrganizations, (o: libs.ObjectId) => o.toHexString() === organizationStringId)) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage(), documentUrl);
            return;
        }

        let themes = await services.mongo.Theme.find({ organization: organizationId }).skip((page - 1) * limit).limit(limit).sort({ createTime: -1 }).populate("creator owners watchers").exec();

        let totalCount = await services.mongo.Theme.count({ organization: organizationId }).exec();

        let result = {
            themes: [],
            totalCount: totalCount
        };

        libs._.each(themes, (t: services.mongo.ThemeDocument) => {
            let creator = <services.mongo.UserDocument>t.creator;

            let theme = {
                id: t._id.toHexString(),
                title: t.title,
                detail: t.detail,
                organizationId: organizationStringId,
                createTime: t.createTime.getTime(),
                creator: {
                    id: creator._id,
                    name: creator.name,
                    email: creator.email
                },
                owners: libs._.map(<services.mongo.UserDocument[]>t.owners, o=> {
                    return {
                        id: o._id,
                        name: o.name,
                        email: o.email
                    }
                }),
                watchers: libs._.map(<services.mongo.UserDocument[]>t.watchers, w=> {
                    return {
                        id: w._id,
                        name: w.name,
                        email: w.email
                    }
                })
            };

            result.themes.push(theme);
        });

        services.response.sendSuccess(response, enums.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
