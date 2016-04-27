"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../../../share/types");
const libs = require("../../../libs");
const settings = require("../../../settings");
const services = require("../../../services");
exports.documentOfGet = {
    url: "/api/user/access_tokens",
    method: types.httpMethod.get,
    documentUrl: "/api/access token/get access tokens.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readAccessToken);
        const accessTokens = yield services.mongo.AccessToken.find({ application: null, creator: request.userId })
            .exec();
        const result = {
            accessTokens: accessTokens.map(a => {
                return {
                    id: a._id.toHexString(),
                    description: a.description,
                    scopes: settings.scopes.filter(s => a.scopes.some(sc => sc === s.name)),
                    lastUsed: a.lastUsed ? a.lastUsed.toISOString() : null,
                };
            }),
        };
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
exports.documentOfCreate = {
    url: "/api/user/access_tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/create an access token.html",
};
function create(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        let description = "";
        if (typeof body.description === "string") {
            description = libs.validator.trim(body.description);
        }
        if (description === "") {
            throw services.error.fromParameterIsMissedMessage("description");
        }
        const scopes = body.scopes;
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);
        const value = libs.generateUuid();
        const accessToken = yield services.mongo.AccessToken.create({
            description: description,
            value: value,
            scopes: scopes,
            creator: request.userId,
        });
        accessToken.save();
        services.logger.logRequest(exports.documentOfCreate.url, request);
        const result = {
            accessToken: value,
        };
        services.response.sendSuccess(response, 201 /* createdOrModified */, result);
    });
}
exports.create = create;
exports.documentOfUpdate = {
    url: "/api/user/access_tokens/:access_token_id",
    method: types.httpMethod.put,
    documentUrl: "/api/access token/update an access token.html",
};
function update(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.access_token_id !== "string"
            || !libs.validator.isMongoId(params.access_token_id)) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }
        const body = request.body;
        let description = libs.validator.trim(body.description);
        if (typeof body.description === "string") {
            description = libs.validator.trim(body.description);
        }
        if (description === "") {
            throw services.error.fromParameterIsMissedMessage("description");
        }
        const scopes = body.scopes;
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);
        const id = new libs.ObjectId(params.access_token_id);
        // the sccess token should be available.
        const accessToken = yield services.mongo.AccessToken.findOne({ _id: id, application: null })
            .exec();
        if (!accessToken) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }
        accessToken.description = description;
        accessToken.scopes = scopes;
        accessToken.save();
        services.logger.logRequest(exports.documentOfUpdate.url, request);
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.update = update;
exports.documentOfRemove = {
    url: "/api/user/access_tokens/:access_token_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/access token/delete an access token.html",
};
function remove(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.access_token_id !== "string"
            || !libs.validator.isMongoId(params.access_token_id)) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }
        const id = new libs.ObjectId(params.access_token_id);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.deleteAccessToken);
        // the access token should be available.
        const accessToken = yield services.mongo.AccessToken.findOne({ _id: id, application: null })
            .exec();
        if (!accessToken) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }
        accessToken.remove();
        services.logger.logRequest(exports.documentOfRemove.url, request);
        services.response.sendSuccess(response, 204 /* deleted */);
    });
}
exports.remove = remove;
