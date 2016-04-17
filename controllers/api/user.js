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
exports.documentOfGet = {
    url: "/api/user",
    method: types.httpMethod.get,
    documentUrl: "/api/user/get current user.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readUser);
        const user = yield services.mongo.User.findOne({ _id: request.userId })
            .select("email name createdOrganizations joinedOrganizations avatar")
            .exec();
        const id = request.userId.toHexString();
        const result = {
            user: {
                id: id,
                email: user.email,
                name: user.name,
                createdOrganizationCount: user.createdOrganizations.length,
                joinedOrganizationCount: user.joinedOrganizations.length,
                avatar: user.avatar || services.avatar.getDefaultName(id),
            },
        };
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
exports.documentOfUpdate = {
    url: "/api/user",
    method: types.httpMethod.put,
    documentUrl: "/api/user/update current user.html",
};
function update(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
        const avatarFileName = typeof body.avatarFileName === "string" ? libs.validator.trim(body.avatarFileName) : "";
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeUser);
        const user = yield services.mongo.User.findOne({ _id: request.userId })
            .select("name avatar")
            .exec();
        // if name changes, then change it.
        if (name && name !== user.name) {
            user.name = name;
            user.save();
        }
        // if change avatar, then move image.
        if (avatarFileName) {
            const newName = settings.imagePaths.avatar + request.userId.toHexString() + libs.path.extname(avatarFileName).toLowerCase();
            const json = yield services.request.postAsync(`${settings.imageUploader}/api/persistence`, {
                name: avatarFileName,
                newName: newName,
            });
            // save new avatar name.
            user.avatar = newName;
            user.save();
            response.status(json.response.statusCode).json(json.body);
        }
        else {
            services.response.sendSuccess(response, 201 /* createdOrModified */);
        }
    });
}
exports.update = update;
