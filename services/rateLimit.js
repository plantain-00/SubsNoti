"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../share/types");
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
const fields = {
    remain: "remain_",
    resetMoment: "resetMoment_",
};
const documentUrl = "/api/response.html";
function route(app) {
    app.all("/api/*", (request, response, next) => __awaiter(this, void 0, void 0, function* () {
        yield services.authenticationCredential.authenticate(request);
        if (!request.userId) {
            yield services.authenticationCredential.authenticateHeader(request);
        }
        if (request.method === "GET") {
            response.setHeader("Last-Modified", new Date().toUTCString());
        }
        // do not limit rate when in test environment
        if (settings.currentEnvironment === types.environment.test) {
            next();
            return;
        }
        let remainKey;
        let resetMomentKey;
        let errorMessage;
        let limit;
        // get key, error message and total limit for current request
        if (request.userId) {
            if (request.method === "POST") {
                remainKey = settings.cacheKeys.rateLimit.contentCreation + fields.remain + request.userId.toHexString();
                resetMomentKey = settings.cacheKeys.rateLimit.contentCreation + fields.resetMoment + request.userId.toHexString();
                errorMessage = "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.";
                limit = settings.rateLimit.contentCreation;
            }
            else {
                remainKey = settings.cacheKeys.rateLimit.userId + fields.remain + request.userId.toHexString();
                resetMomentKey = settings.cacheKeys.rateLimit.userId + fields.resetMoment + request.userId.toHexString();
                errorMessage = "API rate limit exceeded for current user.";
                limit = settings.rateLimit.user;
            }
        }
        else {
            const ip = request.header("X-Real-IP");
            remainKey = settings.cacheKeys.rateLimit.ip + fields.remain + ip;
            resetMomentKey = settings.cacheKeys.rateLimit.ip + fields.resetMoment + ip;
            errorMessage = `API rate limit exceeded for ${ip}, you can login to get a higher rate limit.`;
            limit = settings.rateLimit.ip;
        }
        function setHeaders(remain, resetMoment) {
            response.setHeader(settings.headerNames.rateLimit.limit, limit.toString());
            response.setHeader(settings.headerNames.rateLimit.remain, remain.toString());
            response.setHeader(settings.headerNames.rateLimit.resetMoment, resetMoment);
        }
        let remainString = yield services.redis.get(remainKey);
        if (remainString !== null) {
            // just string to number
            let remain = +remainString;
            let resetMoment = yield services.redis.get(resetMomentKey);
            // if no `resetMoment`, set a new one
            if (!resetMoment) {
                resetMoment = libs.moment().clone().add(1, "hours").toISOString();
                services.redis.set(resetMomentKey, resetMoment, 60 * 60);
                services.redis.expire(remainKey, 60 * 60);
            }
            if (remain <= 0) {
                setHeaders(remain, resetMoment);
                services.response.sendError(response, services.error.fromMessage(errorMessage, 429 /* tooManyRequest */), documentUrl);
                return;
            }
            services.redis.decr(remainKey);
            setHeaders(remain - 1, resetMoment);
        }
        else {
            let resetMoment = libs.moment().clone().add(1, "hours").toISOString();
            services.redis.set(remainKey, limit - 1, 60 * 60);
            services.redis.set(resetMomentKey, resetMoment, 60 * 60);
            setHeaders(limit - 1, resetMoment);
        }
        next();
    }));
}
exports.route = route;