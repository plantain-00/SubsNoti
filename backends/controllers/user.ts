'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let documentOfGet = {
    url: "/api/user",
    method: "get",
    documentUrl: "/doc/api/Get current user.html"
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let userId = await services.user.authenticate(request, documentUrl);
        let user = await services.mongo.User.findOne({ _id: userId }).select('email name createdOrganizations').exec();
        let result: interfaces.CurrentUserResponse = {
            id: userId.toHexString(),
            email: user.email,
            name: user.name,
            canCreateOrganization: user.createdOrganizations.length < services.organization.maxNumberUserCanCreate
        };

        services.response.sendOK(response, documentUrl, result);
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

export function route(app: libs.Application) {
    app[documentOfGet.method](documentOfGet.url, get);
}
