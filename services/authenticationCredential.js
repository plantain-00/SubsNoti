"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
function create(userId, salt) {
    const milliseconds = new Date().getTime();
    return `${libs.md5(salt + milliseconds + userId)}g${milliseconds.toString(16)}g${userId}`;
}
exports.create = create;
/**
 * identify current user.
 */
function authenticateHeader(request) {
    return __awaiter(this, void 0, Promise, function* () {
        const authorization = request.header(settings.headerNames.authorization);
        if (typeof authorization === "string"
            && authorization.length > settings.authorizationHeaders.token.length
            && authorization.startsWith(settings.authorizationHeaders.token)) {
            const token = authorization.substring(settings.authorizationHeaders.token.length);
            const accessToken = yield services.mongo.AccessToken.findOne({ value: token })
                .exec();
            if (accessToken) {
                request.scopes = accessToken.scopes;
                request.application = accessToken.application;
                request.userId = accessToken.creator;
                accessToken.lastUsed = new Date();
                accessToken.save();
            }
        }
    });
}
exports.authenticateHeader = authenticateHeader;
/**
 * identify current user.
 */
function authenticate(request) {
    return __awaiter(this, void 0, Promise, function* () {
        const userId = yield authenticateCookie(request.cookies[settings.cookieKeys.authenticationCredential]);
        request.userId = userId;
    });
}
exports.authenticate = authenticate;
/**
 * identify current user.
 */
function authenticateCookie(cookie) {
    return __awaiter(this, void 0, Promise, function* () {
        if (typeof cookie !== "string") {
            return null;
        }
        const authenticationCredential = cookie.trim();
        // may be it is already in cache.
        const reply = yield services.redis.get(settings.cacheKeys.user + authenticationCredential);
        if (reply) {
            return new libs.ObjectId(reply);
        }
        const tmp = authenticationCredential.split("g");
        if (tmp.length !== 3) {
            return null;
        }
        const milliseconds = parseInt(tmp[1], 16);
        const userId = tmp[2];
        const id = new libs.ObjectId(userId);
        const now = new Date().getTime();
        // should not expire.
        if (now < milliseconds
            || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
            return null;
        }
        // should be a valid user.
        const user = yield services.mongo.User.findOne({ _id: id })
            .select("salt")
            .exec();
        if (!user) {
            return null;
        }
        // should be verified.
        if (libs.md5(user.salt + milliseconds + userId) === tmp[0]) {
            services.redis.set(settings.cacheKeys.user + authenticationCredential, userId, 8 * 60 * 60);
            return id;
        }
        else {
            return null;
        }
    });
}
exports.authenticateCookie = authenticateCookie;
