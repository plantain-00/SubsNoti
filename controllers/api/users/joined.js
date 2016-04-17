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
exports.documentOfInvite = {
    url: "/api/users/:user_email/joined/:organization_id",
    method: types.httpMethod.put,
    documentUrl: "/api/organization/invite an user.html",
};
function invite(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = request.params;
        if (typeof params.organization_id !== "string"
            || !libs.validator.isMongoId(params.organization_id)) {
            throw services.error.fromParameterIsInvalidMessage("organization_id");
        }
        if (typeof params.user_email !== "string"
            || !libs.validator.isEmail(params.user_email)) {
            throw services.error.fromParameterIsInvalidMessage("user_email");
        }
        const organizationId = new libs.ObjectId(params.organization_id);
        const email = libs.validator.trim(params.user_email).toLowerCase();
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeOrganization);
        // the organization should be available.
        const organization = yield services.mongo.Organization.findOne({ _id: organizationId })
            .select("members")
            .exec();
        if (!organization) {
            throw services.error.fromParameterIsInvalidMessage("organization_id");
        }
        // the email should belong to one of users.
        const user = yield services.mongo.User.findOne({ email: email })
            .select("_id joinedOrganizations")
            .exec();
        if (!user) {
            throw services.error.fromParameterIsInvalidMessage("user_email");
        }
        // current user should be a member of the organization
        if (!organization.members.find((m) => m.equals(request.userId))) {
            throw services.error.fromOrganizationIsPrivateMessage();
        }
        // if the user is already a member, do nothing.
        if (!organization.members.find((m) => m.equals(user._id))) {
            user.joinedOrganizations.push(organizationId);
            organization.members.push(user._id);
            user.save();
            organization.save();
        }
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
exports.invite = invite;
