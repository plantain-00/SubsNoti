import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

export const getDocument:interfaces.ApiDocument = {
    name: "get current user",
    url: "/api/current_user.json",
    description: "the authentication credential should be stored in a cookie named '" + services.cookieKey.authenticationCredential + "'",
    method: "GET",
    expirationDate: "no",
    versions: [{
        expirationDate: "no",
        parameters: {
            v: 1
        },
        cookieNames: {
            authenticationCredential: {
                type: "string",
                required: true
            }
        },
        responseBody: {
            isSuccess: {
                type: "boolean"
            },
            statusCode: {
                type: "number"
            },
            errorCode: {
                type: "number"
            },
            errorMessage: {
                type: "string"
            }
        }
    }]
};

export function get(request:libs.Request, response:libs.Response):void {
    var documentUrl = getDocument.documentUrl;

    services.currentUser.get(request, response, documentUrl, (error, user)=> {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        services.response.sendOK(response, documentUrl);
    });
}