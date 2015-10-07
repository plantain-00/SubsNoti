import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let documentOfGet: interfaces.ApiDocument = {
    url: "/api/user",
    method: "get",
    documentUrl: "/doc/api/Get current user.html"
};

export function get(request: libs.Request, response: libs.Response): void {
    let documentUrl = documentOfGet.documentUrl;

    services.currentUser.get(request, documentUrl).then(user=> {
        let result: interfaces.CurrentUserResponse = {
            id: user.id,
            email: services.user.getEmail(user),
            name: user.name,
            canCreateOrganization: user.createdOrganizationIds.length < services.organization.maxNumberUserCanCreate
        };

        services.response.sendOK(response, documentUrl, result);
    }, error=> {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    });
}

export function route(app: libs.Application) {
    app[documentOfGet.method](documentOfGet.url, get);
}