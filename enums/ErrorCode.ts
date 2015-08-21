const enum ErrorCode{
    success,
    wrongContentType,
    parameterMissed,
    accountInWrongStatus,
    dbAccessError,
    emailServiceError,
    unauthorizedError,
    wrongHttpMethod
}

export = ErrorCode;