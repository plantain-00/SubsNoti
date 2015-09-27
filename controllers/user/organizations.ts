import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../enums/enums";
import * as interfaces from "../../interfaces/interfaces";

import * as services from "../../services/services";

const documentOfCreate: interfaces.ApiDocument = {
    url: "/api/user/organizations",
    method: "post",
    documentUrl: "/doc/api/Create an organization.html"
};

export function create(request: libs.Request, response: libs.Response) {
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

    services.currentUser.get(request, response, documentUrl).then(user=> {
        return services.organization.existsByName(organizationName).then(exists=> {
            if (exists) {
                services.response.sendAlreadyExistError(response, "the organization name already exists.", documentUrl);
                return;
            }

            return services.organization.getByCreatorId(user.id).then(organizationIds=> {
                if (organizationIds.length >= services.organization.maxNumberUserCanCreate) {
                    services.response.sendAlreadyExistError(response, "you already created " + organizationIds.length + " organizations.", documentUrl);
                    return;
                }

                return services.db.beginTransactionAsync().then(connection=> {
                    return services.db.accessInTransactionAsync(connection, "insert into organizations (Name,Status,CreatorID) values (?,?,?)", [organizationName, enums.OrganizationStatus.normal, user.id]).then(rows=> {
                        const organizationId = rows.insertId;

                        return services.db.accessInTransactionAsync(connection, "insert into organization_members (OrganizationID,MemberID,IsAdministratorOf) values (?,?,?)", [organizationId, user.id, true]).then(rows=> {
                            return services.db.endTransactionAsync(connection).then(() => {
                                return services.logger.logAsync(documentOfCreate.url, request).then(() => {
                                    services.response.sendCreatedOrModified(response, documentUrl);
                                }, error=> {
                                    console.log(error);
                                    services.response.sendCreatedOrModified(response, documentUrl);
                                });
                            });
                        });
                    });
                });
            });
        }, error=> {
            services.response.sendDBAccessError(response, error.message, documentUrl);
        })
    }, error=> {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    }).done();
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}