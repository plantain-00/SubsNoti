import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../enums/enums";
import * as interfaces from "../../interfaces/interfaces";

import * as services from "../../services/services";

const documentOfCreate: interfaces.ApiDocument = {
    url: "/api/user/themes",
    method: "post",
    documentUrl: "/doc/api/Create a theme.html"
};

export function create(request: libs.Request, response: libs.Response) {
    const documentUrl = documentOfCreate.documentUrl;

    const organizationId = request.body.organizationId;

    if (!organizationId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    let themeTitle = request.body.themeTitle;
    if (!themeTitle) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    themeTitle = themeTitle.trim();
    if (!themeTitle) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    const themeDetail = request.body.themeDetail;

    services.currentUser.get(request, response, documentUrl, (error, user) => {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        services.db.beginTransaction((error, connection) => {
            if (error) {
                services.response.sendDBAccessError(response, error.message, documentUrl);
                return;
            }

            services.db.accessInTransaction(connection, "insert into themes (Title,Detail,OrganizationID,Status,CreatorID,CreateTime) values (?,?,?,?,?,now())", [themeTitle, themeDetail, organizationId, enums.ThemeStatus.normal, user.id], (error, rows) => {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }

                const themeId = rows.insertId;

                services.db.accessInTransaction(connection, "insert into theme_owners (ThemeID,OwnerID) values (?,?)", [themeId, user.id], (error, rows) => {
                    if (error) {
                        services.response.sendDBAccessError(response, error.message, documentUrl);
                        return;
                    }

                    services.db.accessInTransaction(connection, "insert into theme_watchers (ThemeID,WatcherID) values (?,?)", [themeId, user.id], (error, rows) => {
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
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}