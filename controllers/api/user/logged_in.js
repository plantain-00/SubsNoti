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
const settings = require("../../../settings");
const services = require("../../../services");
exports.documentOfDelete = {
    url: "/api/user/logged_in",
    method: types.httpMethod.delete,
    documentUrl: "/api/authentication/log out.html",
};
function deleteThis(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        response.clearCookie(settings.cookieKeys.authenticationCredential, {
            domain: settings.cookieDomains,
        });
        services.response.sendSuccess(response, 204 /* deleted */);
    });
}
exports.deleteThis = deleteThis;
