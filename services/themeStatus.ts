"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let publicOrganizationId: libs.ObjectId;
export let publicOrganizationName = "public";

export function getType(status: types.ThemeStatus): types.ThemeStatusType {
    if (status === types.ThemeStatus.open) {
        return types.themeStatus.open;
    }
    if (status === types.ThemeStatus.closed) {
        return types.themeStatus.closed;
    }
    throw services.error.fromMessage("invalid theme status:" + status, types.StatusCode.internalServerError);
}
