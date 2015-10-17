'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function fromError(error: Error, statusCode: enums.StatusCode): interfaces.E {
    if (error) {
        return {
            statusCode: statusCode,
            name: error.name,
            message: error.message,
            stack: error.stack
        }
    }

    return null;
}

export function fromMessage(message: string, statusCode: enums.StatusCode): interfaces.E {
    return fromError(new Error(message), statusCode);
}

export function fromParameterIsMissedMessage(parameter: string): interfaces.E {
    return fromError(new Error(`the parameter '${parameter}' is missed.`), enums.StatusCode.invalidRequest);
}

export function fromParameterIsInvalidMessage(parameter: string): interfaces.E {
    return fromError(new Error(`the parameter '${parameter}' is invalid.`), enums.StatusCode.invalidRequest);
}

export function fromOrganizationIsPrivateMessage(): interfaces.E {
    return fromError(new Error(`the organization is private and only available to its members.`), enums.StatusCode.unauthorized);
}
