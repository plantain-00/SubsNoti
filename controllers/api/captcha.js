"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../../share/types");
const libs = require("../../libs");
const settings = require("../../settings");
const services = require("../../services");
exports.documentOfCreate = {
    url: "/api/captchas",
    method: types.httpMethod.post,
    documentUrl: "/api/authentication/create an captcha.html",
};
function create(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        const id = typeof body.id === "string" ? libs.validator.trim(body.id) : "";
        if (id === "") {
            throw services.error.fromParameterIsMissedMessage("id");
        }
        const captcha = yield services.captcha.create(id);
        const result = {
            url: captcha.url,
            code: settings.currentEnvironment === types.environment.test ? captcha.code : undefined,
        };
        services.response.sendSuccess(response, 201 /* createdOrModified */, result);
    });
}
exports.create = create;
