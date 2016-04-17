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
const services = require("../services");
function create(email, url, request, name) {
    return __awaiter(this, void 0, Promise, function* () {
        if (!libs.validator.isEmail(email)) {
            return Promise.reject(services.error.fromParameterIsInvalidMessage("email"));
        }
        email = libs.validator.trim(email).toLowerCase();
        // find out if the email is someone's. if no, create an account.
        let user = yield services.mongo.User.findOne({ email: email })
            .exec();
        if (!user) {
            const salt = libs.generateUuid();
            user = yield services.mongo.User.create({
                email: email,
                name: name,
                salt: salt,
                status: 0 /* normal */,
            });
            yield services.avatar.createIfNotExistsAsync(user._id.toHexString());
            services.logger.logRequest(url, request);
        }
        yield services.frequency.limitEmail(email);
        const token = services.authenticationCredential.create(user._id.toHexString(), user.salt);
        return token;
    });
}
exports.create = create;
