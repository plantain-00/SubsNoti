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

export function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;
    
    if (services.contentType.isValid(request)) {
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

    services.user.getCurrent(request, documentUrl).then(user=> {
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
                        let organizationId = rows.insertId;

                        return services.db.accessInTransactionAsync(connection, "insert into organization_members (OrganizationID,MemberID,IsAdministratorOf) values (?,?,?)", [organizationId, user.id, true]).then(rows=> {
                            return services.db.endTransactionAsync(connection).then(() => {
                                services.logger.log(documentOfCreate.url, request);
                                services.response.sendCreatedOrModified(response, documentUrl);
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
    });
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}