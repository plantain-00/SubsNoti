import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import services = require("../services/services");

export function isNotJson(request:libs.Request):boolean {
    const contentType = request.get('Content-Type');
    return !contentType || contentType.indexOf("application/json") == -1
}