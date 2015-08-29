import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("./interfaces");

interface ApiDocumentVersion {
    expirationDate:string;
    parameters:any;
    requestBody?:any;
    responseBody:any;
    cookieNames?:any;
}

export = ApiDocumentVersion;