"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function fromError(error: Error, statusCode: types.StatusCode): types.E {
    if (error) {
        return {
            statusCode: statusCode,
            name: error.name,
            message: error.message,
            stack: error.stack,
        };
    }

    return null;
}

export function fromMessage(message: string, statusCode: types.StatusCode): types.E {
    return fromError(new Error(message), statusCode);
}

export function fromParameterIsMissedMessage(parameter: string): types.E {
    return fromError(new Error(`the parameter '${parameter}' is missed.`), types.StatusCode.invalidRequest);
}

export function fromParameterIsInvalidMessage(parameter: string): types.E {
    return fromError(new Error(`the parameter '${parameter}' is invalid.`), types.StatusCode.invalidRequest);
}

export function fromOrganizationIsPrivateMessage(): types.E {
    return fromError(new Error(`the organization is private and only available to its members.`), types.StatusCode.unauthorized);
}

export function fromThemeIsNotYoursMessage(): types.E {
    return fromError(new Error(`the theme is not owned by you.`), types.StatusCode.unauthorized);
}

export function fromUnauthorized(): types.E {
    return fromError(new Error("the authentication credential is missed, out of date or invalid"), types.StatusCode.unauthorized);
}
