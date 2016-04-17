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
/**
 * create a code, store it in cache, create an image, return an base64 url of it.
 */
function create(id) {
    return __awaiter(this, void 0, Promise, function* () {
        yield services.frequency.limitCaptcha(id);
        // 60466176 == 36 ** 5, the code will be a string of 6 characters. the character is number or upper case letter.
        const code = Math.round((Math.random() * 35 + 1) * 60466176).toString(36).toUpperCase();
        services.redis.set(settings.cacheKeys.userCaptcha + id, code, 60);
        const width = 140;
        const height = 45;
        const canvas = new libs.Canvas(width, 50);
        const context = canvas.getContext("2d");
        context.fillStyle = "#F0F0F0";
        context.fillRect(0, 0, width, 50);
        context.fillStyle = "#000";
        context.font = "30px Georgia";
        context.fillText(code, 10, height - 10);
        return {
            url: canvas.toDataURL(),
            code: code,
        };
    });
}
exports.create = create;
/**
 * validate the code matched the one from the cache.
 */
function validate(id, code) {
    return __awaiter(this, void 0, Promise, function* () {
        const key = settings.cacheKeys.userCaptcha + id;
        const targetCode = yield services.redis.get(key);
        yield services.redis.del(key);
        if (code.toUpperCase() !== targetCode) {
            throw services.error.fromMessage("the code is invalid or expired now.", 400 /* invalidRequest */);
        }
    });
}
exports.validate = validate;
