import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function isNotJson(request: libs.Request): boolean {
    let contentType = request.get('Content-Type');
    return !contentType || contentType.indexOf("application/json") == -1
}