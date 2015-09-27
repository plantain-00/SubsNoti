var enums = require("../../enums/enums");
var services = require("../../services/services");
var documentOfCreate = {
    url: "/api/user/themes",
    method: "post",
    documentUrl: "/doc/api/Create a theme.html"
};
function create(request, response) {
    var documentUrl = documentOfCreate.documentUrl;
    var organizationId = request.body.organizationId;
    if (!organizationId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    var themeTitle = request.body.themeTitle;
    if (!themeTitle) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    themeTitle = themeTitle.trim();
    if (!themeTitle) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    var themeDetail = request.body.themeDetail;
    services.currentUser.get(request, response, documentUrl).then(function (user) {
        return services.db.beginTransactionAsync().then(function (connection) {
            return services.db.accessInTransactionAsync(connection, "insert into themes (Title,Detail,OrganizationID,Status,CreatorID,CreateTime) values (?,?,?,?,?,now())", [themeTitle, themeDetail, organizationId, 0 /* normal */, user.id]).then(function (rows) {
                var themeId = rows.insertId;
                return services.db.accessInTransactionAsync(connection, "insert into theme_owners (ThemeID,OwnerID) values (?,?)", [themeId, user.id]).then(function (rows) {
                    return services.db.accessInTransactionAsync(connection, "insert into theme_watchers (ThemeID,WatcherID) values (?,?)", [themeId, user.id]).then(function (rows) {
                        return services.db.endTransactionAsync(connection).then(function () {
                            services.logger.logAsync(documentOfCreate.url, request).then(function () {
                                services.response.sendCreatedOrModified(response, documentUrl);
                            }, function (error) {
                                console.log(error);
                                services.response.sendCreatedOrModified(response, documentUrl);
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
