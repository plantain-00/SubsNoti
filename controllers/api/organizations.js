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
exports.documentOfCreate = {
    url: "/api/organizations",
    method: types.httpMethod.post,
    documentUrl: "/api/organization/create an organization.html",
};
function create(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = request.body;
        const organizationName = typeof body.organizationName === "string" ? libs.validator.trim(body.organizationName) : "";
        if (organizationName === "") {
            throw services.error.fromParameterIsMissedMessage("organizationName");
        }
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeOrganization);
        // the name should not be used by other organizations.
        if (organizationName === services.seed.publicOrganizationName) {
            throw services.error.fromMessage("the organization name already exists.", 400 /* invalidRequest */);
        }
        const organizationCount = yield services.mongo.Organization.count({ name: organizationName })
            .exec();
        if (organizationCount > 0) {
            throw services.error.fromMessage("the organization name already exists.", 400 /* invalidRequest */);
        }
        // current user should not create too many organizations.
        const user = yield services.mongo.User.findOne({ _id: request.userId })
            .select("createdOrganizations joinedOrganizations")
            .exec();
        if (user.createdOrganizations.length >= settings.maxOrganizationNumberUserCanCreate) {
            throw services.error.fromMessage("you already created " + user.createdOrganizations.length + " organizations.", 400 /* invalidRequest */);
        }
        const organization = yield services.mongo.Organization.create({
            name: organizationName,
            status: 0 /* normal */,
            creator: request.userId,
            members: [request.userId],
        });
        user.createdOrganizations.push(organization._id);
        user.joinedOrganizations.push(organization._id);
        user.save();
        services.logger.logRequest(exports.documentOfCreate.url, request);
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.create = create;
