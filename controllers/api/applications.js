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
const services = require("../../services");
exports.documentOfGet = {
    url: "/api/applications/:id",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get an application.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.id !== "string"
            || !libs.validator.isMongoId(params.id)) {
            throw services.error.fromParameterIsInvalidMessage("id");
        }
        const id = new libs.ObjectId(params.id);
        const application = yield services.mongo.Application.findOne({ _id: id })
            .populate("creator")
            .exec();
        if (!application) {
            throw services.error.fromParameterIsInvalidMessage("id");
        }
        const creator = application.creator;
        const creatorId = creator._id.toHexString();
        const result = {
            application: {
                id: application._id.toHexString(),
                name: application.name,
                homeUrl: application.homeUrl,
                description: application.description,
                creator: {
                    id: creatorId,
                    name: creator.name,
                    avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
                },
            },
        };
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
