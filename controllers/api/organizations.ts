"use strict";

import * as types from "../../types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
    url: "/api/organizations",
    method: "post",
    documentUrl: "/api/organization/create an organization.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    try {
        let body: { organizationName: string; } = request.body;

        let organizationName = libs.validator.trim(body.organizationName);
        if (organizationName === "") {
            throw services.error.fromParameterIsMissedMessage("organizationName");
        }

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        // the name should not be used by other organizations.
        if (organizationName === services.seed.publicOrganizationName) {
            throw services.error.fromMessage("the organization name already exists.", types.StatusCode.invalidRequest);
        }
        let organizationCount = await services.mongo.Organization.count({ name: organizationName })
            .exec();
        if (organizationCount > 0) {
            throw services.error.fromMessage("the organization name already exists.", types.StatusCode.invalidRequest);
        }

        // current user should not create too many organizations.
        let user = await services.mongo.User.findOne({ _id: request.userId })
            .select("createdOrganizations joinedOrganizations")
            .exec();
        if (user.createdOrganizations.length >= settings.maxOrganizationNumberUserCanCreate) {
            throw services.error.fromMessage("you already created " + user.createdOrganizations.length + " organizations.", types.StatusCode.invalidRequest);
        }

        let organization = await services.mongo.Organization.create({
            name: organizationName,
            status: types.OrganizationStatus.normal,
            creator: request.userId,
            members: [request.userId],
        });

        user.createdOrganizations.push(organization._id);
        user.joinedOrganizations.push(organization._id);

        user.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
