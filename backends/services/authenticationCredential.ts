'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function create(userId: string, salt: string): string {
    let milliseconds = new Date().getTime();
    return `${libs.md5(salt + milliseconds + userId) }g${milliseconds.toString(16) }g${userId}`;
}

export async function authenticate(request: libs.Request): Promise<libs.ObjectId> {
    let authenticationCredential = request.cookies[settings.config.cookieKeys.authenticationCredential];
    if (!authenticationCredential || typeof authenticationCredential != "string") {
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("no authentication credential", enums.ErrorCode.unauthorizedError));
    }

    let reply = await services.cache.getStringAsync(settings.config.cacheKeys.user + authenticationCredential);
    if (reply) {
        return Promise.resolve(new libs.ObjectId(reply));
    }

    let tmp = authenticationCredential.split("g");
    if (tmp.length != 3) {
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("invalid authentication credential", enums.ErrorCode.unauthorizedError));
    }

    let milliseconds = parseInt(tmp[1], 16);
    let userId = tmp[2];
    let id = new libs.ObjectId(userId);
    let now = new Date().getTime();

    if (now < milliseconds
        || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("authentication credential is out of date", enums.ErrorCode.unauthorizedError));
    }

    let user = await services.mongo.User.findOne({ _id: id }).exec();
    if (!user) {
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("invalid user", enums.ErrorCode.unauthorizedError));
    }

    if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
        services.cache.setString(settings.config.cacheKeys.user + authenticationCredential, JSON.stringify(user), 8 * 60 * 60);

        return Promise.resolve(id);
    } else {
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("invalid authentication credential", enums.ErrorCode.unauthorizedError));
    }
}