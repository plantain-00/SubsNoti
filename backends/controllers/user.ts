'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let documentOfGet = {
    url: "/api/user",
    method: "get",
    documentUrl: "/doc/api/Get current user.html"
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        // identify current user.
        let userId = await services.authenticationCredential.authenticate(request);

        let user = await services.mongo.User.findOne({ _id: userId })
            .select('email name createdOrganizations joinedOrganizations')
            .exec();
        let result: interfaces.CurrentUserResponse = {
            id: userId.toHexString(),
            email: user.email,
            name: user.name,
            createdOrganizationCount: user.createdOrganizations.length,
            joinedOrganizationCount: user.joinedOrganizations.length
        };

        services.response.sendSuccess(response, enums.StatusCode.OK, result);
    }
    catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
