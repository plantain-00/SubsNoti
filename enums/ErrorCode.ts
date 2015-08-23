const enum ErrorCode{
    success = 0,
    wrongContentType = 1,
    parameterMissed = 2,
    accountInWrongStatus = 3,
    dbAccessError = 4,
    emailServiceError = 5,
    unauthorizedError = 6,
    wrongHttpMethod = 7
}

export = ErrorCode;