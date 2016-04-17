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
const services = require("../services");
services.mongo.connect();
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        const users = yield services.mongo.User.find({}).exec();
        for (const user of users) {
            yield services.avatar.createIfNotExistsAsync(user._id.toHexString());
        }
    }
    catch (error) {
        services.logger.logError(error);
    }
    libs.mongoose.disconnect();
}))();
