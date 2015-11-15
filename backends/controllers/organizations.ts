"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let documentOfCreate: types.Document = {
    url: "/api/organizations",
    method: "post",
    documentUrl: "/doc/api/Create an organization.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    try {
        let organizationName = libs.validator.trim(request.body.organizationName);
        if (organizationName === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("organizationName"), documentUrl);
            return;
        }

        let userId = await services.authenticationCredential.authenticate(request);

        // the name should not be used by other organizations.
        if (organizationName === services.seed.publicOrganizationName) {
            services.response.sendError(response, services.error.fromMessage("the organization name already exists.", types.StatusCode.invalidRequest), documentUrl);
            return;
        }
        let organizationCount = await services.mongo.Organization.count({ name: organizationName })
            .exec();
        if (organizationCount > 0) {
            services.response.sendError(response, services.error.fromMessage("the organization name already exists.", types.StatusCode.invalidRequest), documentUrl);
            return;
        }

        // current user should not create too many organizations.
        let user = await services.mongo.User.findOne({ _id: userId })
            .select("createdOrganizations joinedOrganizations")
            .exec();
        if (user.createdOrganizations.length >= settings.config.maxOrganizationNumberUserCanCreate) {
            services.response.sendError(response, services.error.fromMessage("you already created " + user.createdOrganizations.length + " organizations.", types.StatusCode.invalidRequest), documentUrl);
            return;
        }

        let organization = await services.mongo.Organization.create({
            name: organizationName,
            status: types.OrganizationStatus.normal,
            creator: userId,
            members: [userId],
        });

        user.createdOrganizations.push(organization._id);
        user.joinedOrganizations.push(organization._id);

        user.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
