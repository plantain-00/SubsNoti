"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../../../../share/types");
const libs = require("../../../../libs");
const services = require("../../../../services");
exports.documentOfRegenerate = {
    url: "/api/user/access_tokens/:access_token_id/value",
    method: types.httpMethod.put,
    documentUrl: "/api/access token/update an access token.html",
};
function regenerate(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.access_token_id !== "string"
            || !libs.validator.isMongoId(params.access_token_id)) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);
        const id = new libs.ObjectId(params.access_token_id);
        // the sccess token should be available.
        const accessToken = yield services.mongo.AccessToken.findOne({ _id: id, application: null })
            .exec();
        if (!accessToken) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }
        accessToken.value = libs.generateUuid();
        accessToken.save();
        const result = {
            accessToken: accessToken.value,
        };
        services.response.sendSuccess(response, 201 /* createdOrModified */, result);
    });
}
exports.regenerate = regenerate;
