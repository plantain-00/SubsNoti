import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

import docs = require("./docs");

export function apply(app:libs.Application) {
    controllers.authenticationCredential.route(app);
    controllers.currentUser.route(app);

    for (let api of docs.allDocuments) {
        api.documentUrl = `/doc/api/${libs.md5(api.name)}.html`;
    }
}