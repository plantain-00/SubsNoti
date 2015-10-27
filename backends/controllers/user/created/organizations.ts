'use strict';

import * as libs from "../../../libs";
import * as settings from "../../../settings";

import * as enums from "../../../../common/enums";
import * as interfaces from "../../../../common/interfaces";

import * as services from "../../../services";

export let documentOfGet = {
    url: "/api/user/created/organizations",
    method: "get",
    documentUrl: "/doc/api/Get created organizations.html"
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let userId = await services.authenticationCredential.authenticate(request);

        let user = await services.mongo.User.findOne({ _id: userId })
            .populate('createdOrganizations')
            .select('createdOrganizations')
            .exec();
        let result = {
            organizations: libs._.map(user.createdOrganizations, (o: services.mongo.OrganizationDocument) => {
                return {
                    id: o._id.toHexString(),
                    name: o.name
                };
            })
        };

        services.response.sendSuccess(response, enums.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
