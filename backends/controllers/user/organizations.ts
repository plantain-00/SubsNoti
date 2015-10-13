'use strict';

import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../../common/enums";
import * as interfaces from "../../../common/interfaces";

import * as services from "../../services";

let documentOfCreate = {
    url: "/api/user/organizations",
    method: "post",
    documentUrl: "/doc/api/Create an organization.html"
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    if (services.contentType.isInvalid(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    let organizationName = request.body.organizationName;
    if (!organizationName) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    organizationName = organizationName.trim();
    if (!organizationName) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    try {
        let userId = await services.user.authenticate(request);
        let organization = await services.mongo.Organization.findOne({ name: organizationName }).exec();
        if (organization) {
            services.response.sendAlreadyExistError(response, "the organization name already exists.", documentUrl);
            return;
        }

        let user = await services.mongo.User.findOne({ _id: userId }).select("createdOrganizations").exec();
        if (user.createdOrganizations.length >= services.organization.maxNumberUserCanCreate) {
            services.response.sendAlreadyExistError(response, "you already created " + user.createdOrganizations.length + " organizations.", documentUrl);
            return;
        }

        organization = await services.mongo.Organization.create({
            name: organizationName,
            status: enums.OrganizationStatus.normal,
            creator: userId,
            members: [userId]
        });

        user.createdOrganizations.push(organization._id);
        user.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendCreatedOrModified(response, documentUrl);
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}
