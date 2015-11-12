"use strict";

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function create(userId: string, salt: string): string {
    let milliseconds = new Date().getTime();
    return `${libs.md5(salt + milliseconds + userId) }g${milliseconds.toString(16) }g${userId}`;
}

/**
 * identify current user.
 * if set noReject = true, return null if fails.
 */
export async function authenticate(request: libs.Request, noReject?: boolean): Promise<libs.ObjectId> {
    let authenticationCredential = libs.validator.trim(request.cookies[settings.config.cookieKeys.authenticationCredential]);
    if (!authenticationCredential) {
        if (noReject) {
            return Promise.resolve(null);
        }
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("no authentication credential", enums.StatusCode.unauthorized));
    }

    // may be it is already in cache.
    let reply = await services.cache.getStringAsync(settings.config.cacheKeys.user + authenticationCredential);
    if (reply) {
        return Promise.resolve(new libs.ObjectId(reply));
    }

    let tmp = authenticationCredential.split("g");
    if (tmp.length !== 3) {
        if (noReject) {
            return Promise.resolve(null);
        }
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("invalid authentication credential", enums.StatusCode.unauthorized));
    }

    let milliseconds = parseInt(tmp[1], 16);
    let userId = tmp[2];
    let id = new libs.ObjectId(userId);
    let now = new Date().getTime();

    // should not expire.
    if (now < milliseconds
        || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
        if (noReject) {
            return Promise.resolve(null);
        }
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("authentication credential is out of date", enums.StatusCode.unauthorized));
    }

    // should be a valid user.
    let user = await services.mongo.User.findOne({ _id: id })
        .select("salt")
        .exec();
    if (!user) {
        if (noReject) {
            return Promise.resolve(null);
        }
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("invalid user", enums.StatusCode.unauthorized));
    }

    // should be verified.
    if (libs.md5(user.salt + milliseconds + userId) === tmp[0]) {
        services.cache.setString(settings.config.cacheKeys.user + authenticationCredential, userId, 8 * 60 * 60);

        return Promise.resolve(id);
    } else {
        if (noReject) {
            return Promise.resolve(null);
        }
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("invalid authentication credential", enums.StatusCode.unauthorized));
    }
}
