import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");
import models = require("./models/models");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

import docs = require("./docs");

export function apply(app:libs.Application) {
    controllers.authenticationCredential.route(app);
    controllers.currentUser.route(app);

    libs._.each(docs.allDocuments, (api:interfaces.ApiDocument)=> {
        api.documentUrl = "/doc/api/" + libs.md5(api.name) + ".html";
    });
}