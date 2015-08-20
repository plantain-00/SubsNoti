import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");

const enum StatusCode{
    OK = 200,
    createdOrModified = 201,
    accepted = 202,
    deleted = 204,
    invalidRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    notAcceptable = 406,
    gone = 410,
    unprocessableEntity = 422,
    tooManyRequest = 429,
    internalServerError = 500
}

export = StatusCode;