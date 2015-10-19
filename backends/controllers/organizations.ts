'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let documentOfCreate = {
    url: "/api/organizations",
    method: "post",
    documentUrl: "/doc/api/Create an organization.html"
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    try {
        let organizationName = libs.validator.trim(request.body.organizationName);
        if (organizationName === '') {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("organizationName"), documentUrl);
            return;
        }

        // identify current user.
        let userId = await services.authenticationCredential.authenticate(request);

        // the name should not be used by other organizations.
        if (organizationName === services.seed.publicOrganizationName) {
            services.response.sendError(response, services.error.fromMessage("the organization name already exists.", enums.StatusCode.invalidRequest), documentUrl);
            return;
        }
        let organizationCount = await services.mongo.Organization.count({ name: organizationName })
            .exec();
        if (organizationCount > 0) {
            services.response.sendError(response, services.error.fromMessage("the organization name already exists.", enums.StatusCode.invalidRequest), documentUrl);
            return;
        }

        // current user should not create too many organizations.
        let user = await services.mongo.User.findOne({ _id: userId })
            .select("createdOrganizations joinedOrganizations")
            .exec();
        if (user.createdOrganizations.length >= settings.config.maxOrganizationNumberUserCanCreate) {
            services.response.sendError(response, services.error.fromMessage("you already created " + user.createdOrganizations.length + " organizations.", enums.StatusCode.invalidRequest), documentUrl);
            return;
        }

        let organization = await services.mongo.Organization.create({
            name: organizationName,
            status: enums.OrganizationStatus.normal,
            creator: userId,
            members: [userId]
        });

        user.createdOrganizations.push(organization._id);
        user.joinedOrganizations.push(organization._id);

        user.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendSuccess(response, enums.StatusCode.createdOrModified);
    }
    catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
