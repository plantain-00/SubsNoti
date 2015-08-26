import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");
import models = require("./models/models");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

export const allDocuments:interfaces.ApiDocument[] = [
    controllers.authenticationCredential.createDocument,
    controllers.authenticationCredential.getDocument,
    controllers.currentUser.getDocument
];