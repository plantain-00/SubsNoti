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
        let user = await services.user.getCurrent(request, documentUrl);
        let result: interfaces.CurrentUserResponse = {
            id: user.id,
            email: services.user.getEmail(user),
            name: user.name,
            canCreateOrganization: user.createdOrganizationIds.length < services.organization.maxNumberUserCanCreate
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
