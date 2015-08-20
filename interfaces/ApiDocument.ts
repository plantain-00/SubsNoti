import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import interfaces = require("./interfaces");
import services = require("../services/services");

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