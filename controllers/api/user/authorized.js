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
    url: "/api/user/authorized",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get authorized applications.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);
        const accessTokens = yield services.mongo.AccessToken.find({ creator: request.userId })
            .populate("application")
            .exec();
        for (const accessToken of accessTokens) {
            yield services.mongo.User.populate(accessToken.application, "creator");
        }
        const result = {
            applications: accessTokens.filter(ac => !!ac.application).map(ac => {
                const a = ac.application;
                const creator = a.creator;
                const creatorId = creator._id.toHexString();
                return {
                    id: a._id.toHexString(),
                    name: a.name,
                    homeUrl: a.homeUrl,
                    description: a.description,
                    creator: {
                        id: creatorId,
                        name: creator.name,
                        avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
                    },
                    scopes: settings.scopes.filter(s => ac.scopes.some(sc => sc === s.name)),
                    lastUsed: ac.lastUsed ? ac.lastUsed.toISOString() : null,
                };
            }),
        };
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
exports.documentOfRemove = {
    url: "/api/user/authorized/:application_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/application/revoke an application.html",
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
        yield services.mongo.AccessToken.findOneAndRemove({ creator: request.userId, application: id })
            .exec();
        services.logger.logRequest(exports.documentOfRemove.url, request);
        services.response.sendSuccess(response, 204 /* deleted */);
    });
}
exports.remove = remove;
