import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export function isNotJson(request:libs.Request):boolean {
    const contentType = request.get('Content-Type');
    return !contentType || contentType.indexOf("application/json") == -1
}