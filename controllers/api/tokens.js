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
    url: "/api/tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/authentication/send token via email.html",
};
function create(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        if (typeof body.email !== "string"
            || !libs.validator.isEmail(body.email)) {
            throw services.error.fromParameterIsInvalidMessage("email");
        }
        const email = typeof body.email === "string" ? libs.validator.trim(body.email).toLowerCase() : "";
        const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
        const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
        const guid = typeof body.guid === "string" ? libs.validator.trim(body.guid) : "";
        const redirectUrl = typeof body.redirectUrl === "string" ? libs.validator.trim(body.redirectUrl) : "";
        if (code === "" || guid === "") {
            throw services.error.fromParameterIsInvalidMessage("code or guid");
        }
        yield services.captcha.validate(guid, code);
        const token = yield services.tokens.create(email, exports.documentOfCreate.url, request, name);
        const url = `${settings.api}${settings.urls.login}?` + libs.qs.stringify({
            authentication_credential: token,
            redirect_url: redirectUrl,
        });
        let result;
        if (settings.currentEnvironment === types.environment.test) {
            result = {
                url: url,
            };
        }
        else {
            yield services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);
            result = {};
        }
        services.response.sendSuccess(response, 201 /* createdOrModified */, result);
    });
}
exports.create = create;
