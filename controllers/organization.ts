import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

const documentOfCreate:interfaces.ApiDocument = {
    url: "/api/organizations",
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

                if (organizationIds.length >= services.organization.maxNumberUserCanCreate) {
                    services.response.sendAlreadyExistError(response, "you already created " + organizationIds.length + " organizations.", documentUrl);
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

                        services.db.accessInTransaction(connection, "insert into organization_members (OrganizationID,MemberID,IsAdministratorOf) values (?,?,?)", [organizationId, user.id, true], (error, rows)=> {
                            if (error) {
                                services.response.sendDBAccessError(response, error.message, documentUrl);
                                return;
                            }

                            services.db.endTransaction(connection, error=> {
                                if (error) {
                                    services.response.sendDBAccessError(response, error.message, documentUrl);
                                    return;
                                }

                                services.logger.log(documentOfCreate.url, request, error=> {
                                    if (error) {
                                        console.log(error);
                                    }

                                    services.response.sendCreatedOrModified(response, documentUrl);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

const documentOfGet:interfaces.ApiDocument = {
    url: "/api/organizations.json",
    method: "get",
    documentUrl: "/doc/api/Get organizations.html"
};

export function get(request:libs.Request, response:libs.Response):void {
    const documentUrl = documentOfGet.documentUrl;

    const type:enums.OrganizationQueryType = request.query.type;

    services.currentUser.get(request, response, documentUrl, (error, user)=> {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        if (type == enums.OrganizationQueryType.currentUserIn) {
            services.organization.getByMemberId(user.id, (error, organizations)=> {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }

                const result:interfaces.GetOrganizationsResponse = {
                    organizations: libs._.map(organizations, (o:interfaces.Organization)=> {
                        return {
                            id: o.id,
                            name: o.name
                        };
                    })
                };

                services.response.sendOK(response, documentUrl, result);
            });
        } else {
            services.response.sendInvalidParameterError(response, documentUrl);
        }
    });
}

export function route(app:libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);

    app[documentOfGet.method](documentOfGet.url, get);
}