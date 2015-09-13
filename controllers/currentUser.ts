import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export const getDocument:interfaces.ApiDocument = {
    name: "get current user",
    url: "/api/current_user.json",
    method: "get",
    documentUrl: "/doc/api/_book/Get current user.html"
};

export function get(request:libs.Request, response:libs.Response):void {
    const documentUrl = getDocument.documentUrl;

    services.currentUser.get(request, response, documentUrl, (error, user)=> {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        services.response.sendOK(response, documentUrl, {
            email: services.user.getEmail(user),
            name: user.name
        });
    });
}

export function route(app:libs.Application) {
    app[getDocument.method](getDocument.url, get);
}