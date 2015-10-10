'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function fromIError(error: Error): interfaces.E {
    if (error) {
        return {
            code: enums.ErrorCode.dbAccessError,
            name: error.name,
            message: error.message,
            stack: error.stack
        }
    }

    return null;
}

export function fromError(error: Error, code: enums.ErrorCode): interfaces.E {
    if (error) {
        return {
            code: code,
            name: error.name,
            message: error.message,
            stack: error.stack
        }
    }

    return null;
}

export function fromMessage(message: string, code: enums.ErrorCode): interfaces.E {
    return {
        code: code,
        name: undefined,
        message: message,
        stack: undefined
    }
}
