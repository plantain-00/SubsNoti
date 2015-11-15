"use strict";

import * as types from "../../../../common/types";

import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/created/organizations",
    method: "get",
    documentUrl: "/doc/api/Get created organizations.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let userId = await services.authenticationCredential.authenticate(request);

        let user = await services.mongo.User.findOne({ _id: userId })
            .populate("createdOrganizations")
            .select("createdOrganizations")
            .exec();
        let result = {
            organizations: libs._.map(user.createdOrganizations, (o: services.mongo.OrganizationDocument) => {
                return {
                    id: o._id.toHexString(),
                    name: o.name,
                };
            }),
        };

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
