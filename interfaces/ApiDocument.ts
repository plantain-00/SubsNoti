import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import services = require("../services/services");

interface ApiDocument {
    name:string;
    url:string;
    description:string;
    method:string;
    expirationDate:string;
    contentType:string;
    parameters:any;
    versions:any;
    documentUrl?:string;
}

export = ApiDocument;