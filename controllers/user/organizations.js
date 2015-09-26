var enums = require("../../enums/enums");
var services = require("../../services/services");
var documentOfCreate = {
    url: "/api/user/organizations",
    method: "post",
    documentUrl: "/doc/api/Create an organization.html"
};
function create(request, response) {
    var documentUrl = documentOfCreate.documentUrl;
    var organizationName = request.body.organizationName;
    if (!organizationName) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    organizationName = organizationName.trim();
    if (!organizationName) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    services.currentUser.get(request, response, documentUrl, function (error, user) {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }
        services.organization.existsByName(organizationName, function (error, exists) {
            if (error) {
                services.response.sendDBAccessError(response, error.message, documentUrl);
                return;
            }
            if (exists) {
                services.response.sendAlreadyExistError(response, "the organization name already exists.", documentUrl);
                return;
            }
            services.organization.getByCreatorId(user.id, function (error, organizationIds) {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }
                if (organizationIds.length >= services.organization.maxNumberUserCanCreate) {
                    services.response.sendAlreadyExistError(response, "you already created " + organizationIds.length + " organizations.", documentUrl);
                    return;
                }
                services.db.beginTransaction(function (error, connection) {
                    if (error) {
                        services.response.sendDBAccessError(response, error.message, documentUrl);
                        return;
                    }
                    services.db.accessInTransaction(connection, "insert into organizations (Name,Status,CreatorID) values (?,?,?)", [organizationName, 0 /* normal */, user.id], function (error, rows) {
                        if (error) {
                            services.response.sendDBAccessError(response, error.message, documentUrl);
                            return;
                        }
                        var organizationId = rows.insertId;
                        services.db.accessInTransaction(connection, "insert into organization_members (OrganizationID,MemberID,IsAdministratorOf) values (?,?,?)", [organizationId, user.id, true], function (error, rows) {
                            if (error) {
                                services.response.sendDBAccessError(response, error.message, documentUrl);
                                return;
                            }
                            services.db.endTransaction(connection, function (error) {
                                if (error) {
                                    services.response.sendDBAccessError(response, error.message, documentUrl);
                                    return;
                                }
                                services.logger.log(documentOfCreate.url, request, function (error) {
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
exports.create = create;
function route(app) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}
exports.route = route;
