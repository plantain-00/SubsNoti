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
const services = require("../../../services");
exports.documentOfGet = {
    url: "/api/user/created",
    method: types.httpMethod.get,
    documentUrl: "/api/organization/get created organizations.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readOrganization);
        const user = yield services.mongo.User.findOne({ _id: request.userId })
            .populate("createdOrganizations")
            .select("createdOrganizations")
            .exec();
        const result = {
            organizations: user.createdOrganizations.map((o) => {
                return {
                    id: o._id.toHexString(),
                    name: o.name,
                };
            }),
        };
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
