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