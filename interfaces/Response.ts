import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("./interfaces");

interface Response {
    isSuccess: boolean;
    statusCode: enums.StatusCode;
    errorCode: enums.ErrorCode;
    errorMessage: string;
    documentUrl: string;
}

export = Response;