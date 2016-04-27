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
    url: "/api/access_tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/create an access token for application.html",
};
function create(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        const clientId = typeof body.clientId === "string" ? libs.validator.trim(body.clientId) : "";
        if (clientId === "") {
            throw services.error.fromParameterIsMissedMessage("clientId");
        }
        const clientSecret = typeof body.clientSecret === "string" ? libs.validator.trim(body.clientSecret) : "";
        if (clientSecret === "") {
            throw services.error.fromParameterIsMissedMessage("clientSecret");
        }
        const state = typeof body.state === "string" ? libs.validator.trim(body.state) : "";
        if (state === "") {
            throw services.error.fromParameterIsMissedMessage("state");
        }
        const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
        if (code === "") {
            throw services.error.fromParameterIsMissedMessage("code");
        }
        const value = yield services.redis.get(settings.cacheKeys.oauthLoginCode + code);
        if (!value) {
            throw services.error.fromMessage("code is invalid or expired", 401 /* unauthorized */);
        }
        const json = JSON.parse(value);
        if (state !== json.state) {
            throw services.error.fromMessage("state is invalid", 401 /* unauthorized */);
        }
        const application = yield services.mongo.Application.findOne({
            clientId: clientId,
            clientSecret: clientSecret,
        }).exec();
        if (!application) {
            throw services.error.fromMessage("client id or client secret is invalid", 401 /* unauthorized */);
        }
        const creator = new libs.ObjectId(json.creator);
        const accessTokenValue = libs.generateUuid();
        const applicationId = new libs.ObjectId(json.application);
        // remove old access token, the old one may have smaller scopes
        yield services.mongo.AccessToken.remove({
            creator: creator,
            application: applicationId,
        }).exec();
        const accessToken = yield services.mongo.AccessToken.create({
            value: accessTokenValue,
            scopes: json.scopes,
            creator: creator,
            application: applicationId,
        });
        accessToken.save();
        services.logger.logRequest(exports.documentOfCreate.url, request);
        const result = {
            accessToken: accessTokenValue,
        };
        services.response.sendSuccess(response, 201 /* createdOrModified */, result);
    });
}
exports.create = create;
