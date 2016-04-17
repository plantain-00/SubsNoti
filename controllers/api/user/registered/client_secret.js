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
exports.documentOfReset = {
    url: "/api/user/registered/:application_id/client_secret",
    method: types.httpMethod.put,
    documentUrl: "/api/application/reset client secret.html",
};
function reset(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.application_id !== "string"
            || !libs.validator.isMongoId(params.application_id)) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }
        const id = new libs.ObjectId(params.application_id);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);
        // the application should be available.
        const application = yield services.mongo.Application.findOne({ _id: id })
            .exec();
        if (!application) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }
        application.clientSecret = libs.generateUuid();
        application.save();
        services.logger.logRequest(exports.documentOfReset.url, request);
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.reset = reset;
