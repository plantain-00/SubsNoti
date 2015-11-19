"use strict";

import * as types from "../../../common/types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/joined",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html",
};

export let documentOfUserJoinedOrganization: types.ObsoleteDocument = {
    url: "/api/user/joined/organizations",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html",
    versionRange: "<0.12.0",
    expiredDate: "2015-11-25",
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let userId = await services.authenticationCredential.authenticate(request, true);

        let result;

        if (userId) {
            let user = await services.mongo.User.findOne({ _id: userId })
                .populate("joinedOrganizations")
                .select("joinedOrganizations")
                .exec();
            result = {
                organizations: libs._.map(user.joinedOrganizations, (o: services.mongo.OrganizationDocument) => {
                    return {
                        id: o._id.toHexString(),
                        name: o.name,
                    };
                }),
            };
        } else {
            result = {
                organizations: []
            };
        }

        // public organization is also available.
        result.organizations.push({
            id: services.seed.publicOrganizationId.toHexString(),
            name: services.seed.publicOrganizationName,
        });

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}

export let documentOfInvite: types.Document = {
    url: "/api/users/:user_email/joined/:organization_id",
    method: "put",
    documentUrl: "/doc/api/Invite an user.html",
};

export let documentOfObsoleteInvite: types.ObsoleteDocument = {
    url: "/api/organizations/:organization_id/user/:user_email/joined",
    method: "post",
    documentUrl: "/doc/api/Invite an user.html",
    versionRange: "<0.12.2",
    expiredDate: "2015-11-25",
};

export async function invite(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfInvite.documentUrl;

    if (!libs.validator.isMongoId(request.params.organization_id)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("organization_id"), documentUrl);
        return;
    }

    if (!libs.validator.isEmail(request.params.user_email)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("user_email"), documentUrl);
        return;
    }

    try {
        let organizationId = new libs.ObjectId(request.params.organization_id);
        let email = libs.validator.trim(request.params.user_email).toLowerCase();

        let userId = await services.authenticationCredential.authenticate(request);

        // the organization should be available.
        let organization = await services.mongo.Organization.findOne({ _id: organizationId })
            .select("members")
            .exec();
        if (!organization) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("organization_id"), documentUrl);
            return;
        }

        // the email should belong to one of users.
        let user = await services.mongo.User.findOne({ email: email })
            .select("_id joinedOrganizations")
            .exec();
        if (!user) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("user_email"), documentUrl);
            return;
        }

        // current user should be a member of the organization
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.equals(userId))) {
            services.response.sendError(response, services.error.fromOrganizationIsPrivateMessage(), documentUrl);
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
        services.response.sendError(response, error, documentUrl);
    }
}
