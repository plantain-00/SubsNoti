const enum ErrorCode{
    success = 0,
    wrongContentType = 1,
    parameterMissed = 2,
    invalidParameter = 3,
    dbAccessError = 4,
    emailServiceError = 5,
    unauthorizedError = 6,
    wrongHttpMethod = 7,
    alreadyExistError = 8
}

export = ErrorCode;