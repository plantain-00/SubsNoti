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
        let user = await services.user.getCurrent(request, documentUrl);
        let exists = await services.organization.existsByName(organizationName);
        if (exists) {
            services.response.sendAlreadyExistError(response, "the organization name already exists.", documentUrl);
            return;
        }

        let organizationIds = await services.organization.getByCreatorId(user.id);
        if (organizationIds.length >= services.organization.maxNumberUserCanCreate) {
            services.response.sendAlreadyExistError(response, "you already created " + organizationIds.length + " organizations.", documentUrl);
            return;
        }

        let connection = await services.db.beginTransactionAsync();
        let rows = await services.db.insertInTransactionAsync(connection, "insert into organizations (Name,Status,CreatorID) values (?,?,?)", [organizationName, enums.OrganizationStatus.normal, user.id]);
        let organizationId = rows.insertId;

        await services.db.insertInTransactionAsync(connection, "insert into organization_members (OrganizationID,MemberID,IsAdministratorOf) values (?,?,?)", [organizationId, user.id, true]);
        await services.db.endTransactionAsync(connection);
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
