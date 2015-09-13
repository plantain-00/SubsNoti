import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("./interfaces");

interface ApiDocument {
    url:string;
    method:string;
    documentUrl?:string;
}

export = ApiDocument;