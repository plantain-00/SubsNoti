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
const services = require("../../../services");
exports.documentOfGet = {
    url: "/api/user/registered",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get registered applications.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);
        const applications = yield services.mongo.Application.find({ creator: request.userId })
            .exec();
        const result = {
            applications: applications.map(a => {
                return {
                    id: a._id.toHexString(),
                    name: a.name,
                    homeUrl: a.homeUrl,
                    description: a.description,
                    authorizationCallbackUrl: a.authorizationCallbackUrl,
                    clientId: a.clientId,
                    clientSecret: a.clientSecret,
                };
            }),
        };
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
exports.documentOfCreate = {
    url: "/api/user/registered",
    method: types.httpMethod.post,
    documentUrl: "/api/application/register an application.html",
};
function create(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
        if (name === "") {
            throw services.error.fromParameterIsMissedMessage("name");
        }
        if (typeof body.homeUrl !== "string"
            || !libs.validator.isURL(body.homeUrl)) {
            throw services.error.fromParameterIsInvalidMessage("homeUrl");
        }
        const homeUrl = libs.validator.trim(body.homeUrl);
        const description = typeof body.description === "string" ? libs.validator.trim(body.description) : "";
        if (typeof body.authorizationCallbackUrl !== "string"
            || !libs.validator.isURL(body.authorizationCallbackUrl)) {
            throw services.error.fromParameterIsInvalidMessage("authorizationCallbackUrl");
        }
        const authorizationCallbackUrl = libs.validator.trim(body.authorizationCallbackUrl);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);
        const application = yield services.mongo.Application.create({
            name: name,
            homeUrl: homeUrl,
            description: description,
            authorizationCallbackUrl: authorizationCallbackUrl,
            clientId: libs.generateUuid(),
            clientSecret: libs.generateUuid(),
            creator: request.userId,
        });
        application.save();
        services.logger.logRequest(exports.documentOfCreate.url, request);
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.create = create;
exports.documentOfUpdate = {
    url: "/api/user/registered/:application_id",
    method: types.httpMethod.put,
    documentUrl: "/api/application/update an application.html",
};
function update(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.application_id !== "string"
            || !libs.validator.isMongoId(params.application_id)) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }
        const body = request.body;
        const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
        if (name === "") {
            throw services.error.fromParameterIsMissedMessage("name");
        }
        if (typeof body.homeUrl !== "string"
            || !libs.validator.isURL(body.homeUrl)) {
            throw services.error.fromParameterIsInvalidMessage("homeUrl");
        }
        const homeUrl = libs.validator.trim(body.homeUrl);
        const description = typeof body.description === "string" ? libs.validator.trim(body.description) : "";
        if (typeof body.authorizationCallbackUrl !== "string"
            || !libs.validator.isURL(body.authorizationCallbackUrl)) {
            throw services.error.fromParameterIsInvalidMessage("authorizationCallbackUrl");
        }
        const authorizationCallbackUrl = libs.validator.trim(body.authorizationCallbackUrl);
        const id = new libs.ObjectId(params.application_id);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);
        // the application should be available.
        const application = yield services.mongo.Application.findOne({ _id: id })
            .exec();
        if (!application) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }
        application.name = name;
        application.homeUrl = homeUrl;
        application.description = description;
        application.authorizationCallbackUrl = authorizationCallbackUrl;
        application.save();
        services.logger.logRequest(exports.documentOfUpdate.url, request);
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.update = update;
exports.documentOfRemove = {
    url: "/api/user/registered/:application_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/application/delete an application.html",
};
function remove(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.application_id !== "string"
            || !libs.validator.isMongoId(params.application_id)) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }
        const id = new libs.ObjectId(params.application_id);
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.deleteApplication);
        // the application should be available.
        const application = yield services.mongo.Application.findOne({ _id: id })
            .exec();
        if (!application) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }
        yield services.mongo.AccessToken.remove({ application: application._id }).exec();
        application.remove();
        services.logger.logRequest(exports.documentOfRemove.url, request);
        services.response.sendSuccess(response, 204 /* deleted */);
    });
}
exports.remove = remove;
