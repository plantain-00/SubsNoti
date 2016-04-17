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
const settings = require("../settings");
const services = require("../services");
/**
 * make sure operation of `send email` does not reach the limit.
 */
function limitEmail(key) {
    return __awaiter(this, void 0, Promise, function* () {
        return limit(key, settings.rateLimit.sendEmail, settings.cacheKeys.rateLimit.sendEmail);
    });
}
exports.limitEmail = limitEmail;
/**
 * make sure operation of `get captcha` does not reach the limit.
 */
function limitCaptcha(key) {
    return __awaiter(this, void 0, Promise, function* () {
        return limit(key, settings.rateLimit.userCaptcha, settings.cacheKeys.rateLimit.userCaptcha);
    });
}
exports.limitCaptcha = limitCaptcha;
function limit(key, seconds, keyPrefix) {
    return __awaiter(this, void 0, Promise, function* () {
        if (settings.currentEnvironment === types.environment.test) {
            return;
        }
        const frequencyKey = keyPrefix + key;
        const value = yield services.redis.get(frequencyKey);
        if (value) {
            const reply = yield services.redis.ttl(frequencyKey);
            return Promise.reject(services.error.fromMessage(`do it later after ${reply} seconds`, 429 /* tooManyRequest */));
        }
        services.redis.set(frequencyKey, "1", seconds);
    });
}
