import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import models = require("../models/models");
import interfaces = require("./interfaces");

interface ApiDocument {
    name:string;
    url:string;
    description:string;
    method:string;
    expirationDate:string;
    contentType?:string;
    versions:interfaces.ApiDocumentVersion[];
    documentUrl?:string;
}

export = ApiDocument;