import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import interfaces = require("./interfaces");
import services = require("../services/services");

interface ApiDocumentVersion {
    expirationDate:string;
    parameters:any;
    requestBody?:any;
    responseBody:any;
    cookieNames?:any;
}

export = ApiDocumentVersion;