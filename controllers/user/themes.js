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
    services.currentUser.get(request, response, documentUrl, function (error, user) {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }
        services.db.beginTransaction(function (error, connection) {
            if (error) {
                services.response.sendDBAccessError(response, error.message, documentUrl);
                return;
            }
            services.db.accessInTransaction(connection, "insert into themes (Title,Detail,OrganizationID,Status,CreatorID,CreateTime) values (?,?,?,?,?,now())", [themeTitle, themeDetail, organizationId, 0 /* normal */, user.id], function (error, rows) {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }
                var themeId = rows.insertId;
                services.db.accessInTransaction(connection, "insert into theme_owners (ThemeID,OwnerID) values (?,?)", [themeId, user.id], function (error, rows) {
                    if (error) {
                        services.response.sendDBAccessError(response, error.message, documentUrl);
                        return;
                    }
                    services.db.accessInTransaction(connection, "insert into theme_watchers (ThemeID,WatcherID) values (?,?)", [themeId, user.id], function (error, rows) {
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
}
exports.create = create;
function route(app) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}
exports.route = route;
