"use strict";

import * as types from "../../../common/types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/joined",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html",
};

export let documentOfUserJoinedOrganization: types.ObsoleteDocument = {
    url: "/api/user/joined/organizations",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html",
    versionRange: "<0.12.0",
    expiredDate: "2015-11-25",
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let userId = request.userId;

        let result;

        if (userId) {
            let user = await services.mongo.User.findOne({ _id: userId })
                .populate("joinedOrganizations")
                .select("joinedOrganizations")
                .exec();
            result = {
                organizations: libs._.map(user.joinedOrganizations, (o: services.mongo.OrganizationDocument) => {
                    return {
                        id: o._id.toHexString(),
                        name: o.name,
                    };
                }),
            };
        } else {
            result = {
                organizations: []
            };
        }

        // public organization is also available.
        result.organizations.push({
            id: services.seed.publicOrganizationId.toHexString(),
            name: services.seed.publicOrganizationName,
        });

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
