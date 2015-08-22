import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");
import models = require("./models/models");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

import docs = require("./docs");

export function apply(app:libs.Application) {

    app.post(controllers.token.generateDocument.url, controllers.token.generate);
    app.get(controllers.token.acceptDocument.url, controllers.token.accept);
    app.get(controllers.token.validateDocument.url, controllers.token.validate);

    libs._.each(docs.notGetDocuments, (api:interfaces.ApiDocument)=> {
        app.get(api.url, (request:libs.Request, response:libs.Response)=> {
            services.response.sendWrongHttpMethod(response, api.documentUrl);
        });
    });

    libs._.each(docs.allDocuments, (api:interfaces.ApiDocument)=> {
        api.documentUrl = "/doc/api/" + libs.md5(api.name) + ".html";
    });
}