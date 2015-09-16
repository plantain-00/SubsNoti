import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export const documentOfCreate:interfaces.ApiDocument = {
    url: "/api/organization",
    method: "post",
    documentUrl: "/doc/api/Create an organization.html"
};

export function create(request:libs.Request, response:libs.Response) {
    const documentUrl = documentOfCreate.documentUrl;

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

    services.currentUser.get(request, response, documentUrl, (error, user)=> {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        services.organization.existsByName(organizationName, (error, exists)=> {
            if (error) {
                services.response.sendDBAccessError(response, error.message, documentUrl);
                return;
            }

            if (exists) {
                services.response.sendAlreadyExistError(response, "the organization name already exists.", documentUrl);
                return;
            }

            services.organization.getByCreatorId(user.id, (error, organizationIds)=> {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }

                if (organizationIds.length >= 3) {
                    services.response.sendAlreadyExistError(response, "you already created 3 organizations.", documentUrl);
                    return;
                }

                services.db.beginTransaction((error, connection)=> {
                    if (error) {
                        services.response.sendDBAccessError(response, error.message, documentUrl);
                        return;
                    }

                    services.db.accessInTransaction(connection, "insert into organizations (Name,Status,CreatorID) values (?,?,?)", [organizationName, enums.OrganizationStatus.normal, user.id], (error, rows)=> {
                        if (error) {
                            services.response.sendDBAccessError(response, error.message, documentUrl);
                            return;
                        }

                        const organizationId = rows.insertId;

                        services.db.accessInTransaction(connection, "insert into organization_members (OrganizationID,MemberID,IsAdministratorOf) values (?,?,?)", [organizationId, user.id, 1], (error, rows)=> {
                            if (error) {
                                services.response.sendDBAccessError(response, error.message, documentUrl);
                                return;
                            }

                            services.db.endTransaction(connection, error=> {
                                if (error) {
                                    services.response.sendDBAccessError(response, error.message, documentUrl);
                                    return;
                                }

                                services.response.sendCreatedOrModified(response, documentUrl);
                            });
                        });
                    });
                });
            });
        });
    });
}

export function route(app:libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}