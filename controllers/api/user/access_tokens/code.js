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
const settings = require("../../../../settings");
const services = require("../../../../services");
exports.documentOfConfirm = {
    url: "/api/user/access_tokens/:code",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/confirm.html",
};
function confirm(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const code = request.params.code;
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);
        const value = yield services.redis.get(settings.cacheKeys.oauthLoginCode + code);
        const json = JSON.parse(value);
        json.confirmed = true;
        services.redis.set(settings.cacheKeys.oauthLoginCode + code, JSON.stringify(json));
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.confirm = confirm;
;
