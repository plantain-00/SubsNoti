import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");

const enum ErrorCode{
    success,
    wrongContentType,
    parameterMissed,
    accountInWrongStatus,
    dbAccessError,
    emailServiceError,
    unauthorizedError
}

export = ErrorCode;