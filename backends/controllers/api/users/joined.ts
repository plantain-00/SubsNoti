"use strict";

import * as types from "../../../../common/types";

import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfInvite: types.Document = {
    url: "/api/users/:user_email/joined/:organization_id",
    method: "put",
    documentUrl: "/api/organization/invite an user.html",
};

export async function invite(request: libs.Request, response: libs.Response) {
    if (!libs.validator.isMongoId(request.params.organization_id)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("organization_id"));
        return;
    }

    if (!libs.validator.isEmail(request.params.user_email)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("user_email"));
        return;
    }

    try {
        let organizationId = new libs.ObjectId(request.params.organization_id);
        let email = libs.validator.trim(request.params.user_email).toLowerCase();

        let userId = request.userId;
        if (!userId) {
            services.response.sendError(response, services.error.fromUnauthorized());
            return;
        }

        // the organization should be available.
        let organization = await services.mongo.Organization.findOne({ _id: organizationId })
            .select("members")
            .exec();
        if (!organization) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("organization_id"));
            return;
        }

        // the email should belong to one of users.
        let user = await services.mongo.User.findOne({ email: email })
            .select("_id joinedOrganizations")
            .exec();
        if (!user) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("user_email"));
            return;
        }

        // current user should be a member of the organization
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.equals(userId))) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage());
            return;
        }

        // if the user is already a member, do nothing.
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.equals(user._id))) {
            user.joinedOrganizations.push(organizationId);
            organization.members.push(user._id);

            user.save();
            organization.save();
        }

        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}