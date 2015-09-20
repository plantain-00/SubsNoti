import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

const documentOfGet:interfaces.ApiDocument = {
    url: "/api/current_user.json",
    method: "get",
    documentUrl: "/doc/api/Get current user.html"
};

export function get(request:libs.Request, response:libs.Response):void {
    const documentUrl = documentOfGet.documentUrl;

    services.currentUser.get(request, response, documentUrl, (error, user)=> {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        const result:interfaces.GetCurrentUserResponse = {
            email: services.user.getEmail(user),
            name: user.name,
            canCreateOrganization: user.createdOrganizationIds.length < services.organization.maxNumberUserCanCreate
        };

        services.response.sendOK(response, documentUrl, result);
    });
}

export function route(app:libs.Application) {
    app[documentOfGet.method](documentOfGet.url, get);
}