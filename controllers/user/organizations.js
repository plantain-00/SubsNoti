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
    services.currentUser.get(request, response, documentUrl).then(function (user) {
        return services.organization.existsByName(organizationName).then(function (exists) {
            if (exists) {
                services.response.sendAlreadyExistError(response, "the organization name already exists.", documentUrl);
                return;
            }
            return services.organization.getByCreatorId(user.id).then(function (organizationIds) {
                if (organizationIds.length >= services.organization.maxNumberUserCanCreate) {
                    services.response.sendAlreadyExistError(response, "you already created " + organizationIds.length + " organizations.", documentUrl);
                    return;
                }
                return services.db.beginTransactionAsync().then(function (connection) {
                    return services.db.accessInTransactionAsync(connection, "insert into organizations (Name,Status,CreatorID) values (?,?,?)", [organizationName, 0 /* normal */, user.id]).then(function (rows) {
                        var organizationId = rows.insertId;
                        return services.db.accessInTransactionAsync(connection, "insert into organization_members (OrganizationID,MemberID,IsAdministratorOf) values (?,?,?)", [organizationId, user.id, true]).then(function (rows) {
                            return services.db.endTransactionAsync(connection).then(function () {
                                return services.logger.logAsync(documentOfCreate.url, request).then(function () {
                                    services.response.sendCreatedOrModified(response, documentUrl);
                                }, function (error) {
                                    console.log(error);
                                    services.response.sendCreatedOrModified(response, documentUrl);
                                });
                            });
                        });
                    });
                });
            });
        }, function (error) {
            services.response.sendDBAccessError(response, error.message, documentUrl);
        });
    }, function (error) {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    }).done();
}
exports.create = create;
function route(app) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}
exports.route = route;
