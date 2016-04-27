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
    url: "/api/user/joined",
    method: types.httpMethod.get,
    documentUrl: "/api/organization/get joined organizations.html",
};
function get(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        let result;
        if (request.userId
            && services.scope.contain(request, types.scopeNames.readOrganization)) {
            const user = yield services.mongo.User.findOne({ _id: request.userId })
                .populate("joinedOrganizations")
                .select("joinedOrganizations")
                .exec();
            result = {
                organizations: user.joinedOrganizations.map((o) => {
                    return {
                        id: o._id.toHexString(),
                        name: o.name,
                    };
                }),
            };
        }
        else {
            result = {
                organizations: [],
            };
        }
        // public organization is also available.
        result.organizations.push({
            id: services.seed.publicOrganizationId.toHexString(),
            name: services.seed.publicOrganizationName,
        });
        services.response.sendSuccess(response, 200 /* OK */, result);
    });
}
exports.get = get;
