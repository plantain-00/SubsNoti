'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function isInvalid(request: libs.Request): boolean {
    let contentType = request.get('Content-Type');

    if (contentType) {
        if (contentType.indexOf("application/json") > -1) {
            return false;
        }

        if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
            return false;
        }
    }

    return true;
}