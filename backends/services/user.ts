'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

interface User {
    id: number;
    name: string;
    emailHead: string;
    emailTail: string;
    salt: string;
    status: enums.UserStatus;

    createdOrganizationIds?: number[];
}

export async function getById(id: number): Promise<User> {
    let rows = await services.db.queryAsync("select * from users where ID = ?", [id]);
    if (rows.length == 0) {
        return Promise.resolve<User>(null);
    }

    return Promise.resolve(getFromRow(rows[0]));
}

export async function getByEmail(emailHead: string, emailTail: string): Promise<User> {
    let rows = await services.db.queryAsync("select * from users where EmailHead = ? and EmailTail = ?", [emailHead, emailTail]);
    if (rows.length == 0) {
        return Promise.resolve(null);
    }

    if (rows.length > 1) {
        return Promise.reject<User>(services.error.fromMessage("the account is in wrong status now", enums.ErrorCode.invalidData));
    }

    return Promise.resolve(getFromRow(rows[0]));
}

export async function authenticate(request: libs.Request, documentUrl: string): Promise<libs.ObjectId> {
    let authenticationCredential = request.cookies[services.cookieKey.authenticationCredential];
    if (!authenticationCredential || typeof authenticationCredential != "string") {
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("no authentication credential", enums.ErrorCode.unauthorizedError));
    }

    let reply = await services.cache.getStringAsync(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential));
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
        services.cache.setString(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential), JSON.stringify(user), 8 * 60 * 60);

        return Promise.resolve(id);
    } else {
        return Promise.reject<libs.ObjectId>(services.error.fromMessage("invalid authentication credential", enums.ErrorCode.unauthorizedError));
    }
}

export async function getCurrent(request: libs.Request, documentUrl: string): Promise<User> {
    let authenticationCredential = request.cookies[services.cookieKey.authenticationCredential];
    if (!authenticationCredential || typeof authenticationCredential != "string") {
        return Promise.reject<User>(services.error.fromMessage("no authentication credential", enums.ErrorCode.unauthorizedError));
    }

    let reply = await services.cache.getStringAsync(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential));
    if (reply) {
        let userFromCache: User = JSON.parse(reply);
        return Promise.resolve(userFromCache);
    }

    let tmp = authenticationCredential.split("g");
    if (tmp.length != 3) {
        return Promise.reject<User>(services.error.fromMessage("invalid authentication credential", enums.ErrorCode.unauthorizedError));
    }

    let milliseconds = parseInt(tmp[1], 16);
    let userId = parseInt(tmp[2], 16);
    let now = new Date().getTime();

    if (now < milliseconds
        || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
        return Promise.reject<User>(services.error.fromMessage("authentication credential is out of date", enums.ErrorCode.unauthorizedError));
    }

    let user = await getById(userId);
    if (!user) {
        return Promise.reject<User>(services.error.fromMessage("invalid user", enums.ErrorCode.unauthorizedError));
    }

    if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
        let organizationIds = await services.organization.getByCreatorId(user.id);
        user.createdOrganizationIds = organizationIds;

        services.cache.setString(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential), JSON.stringify(user), 8 * 60 * 60);

        return Promise.resolve(user);
    } else {
        return Promise.reject<User>(services.error.fromMessage("invalid authentication credential", enums.ErrorCode.unauthorizedError));
    }
}

export function getFromRow(row: any): User {
    return {
        id: row.ID,
        name: row.Name,
        emailHead: row.EmailHead,
        emailTail: row.EmailTail,
        salt: row.Salt,
        status: row.Status
    }
}

export function getEmail(user: User): string {
    return `${user.emailHead}@${user.emailTail}`;
}
