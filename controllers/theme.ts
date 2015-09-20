import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

const documentOfCreate:interfaces.ApiDocument = {
    url: "/api/themes",
    method: "post",
    documentUrl: "/doc/api/Create a theme.html"
};

export function create(request:libs.Request, response:libs.Response) {
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

    services.currentUser.get(request, response, documentUrl, (error, user)=> {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        services.db.beginTransaction((error, connection)=> {
            if (error) {
                services.response.sendDBAccessError(response, error.message, documentUrl);
                return;
            }

            services.db.accessInTransaction(connection, "insert into themes (Title,Detail,OrganizationID,Status,CreatorID,CreateTime) values (?,?,?,?,?,now())", [themeTitle, themeDetail, organizationId, enums.ThemeStatus.normal, user.id], (error, rows)=> {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }

                const themeId = rows.insertId;

                services.db.accessInTransaction(connection, "insert into theme_owners (ThemeID,OwnerID) values (?,?)", [themeId, user.id], (error, rows)=> {
                    if (error) {
                        services.response.sendDBAccessError(response, error.message, documentUrl);
                        return;
                    }

                    services.db.accessInTransaction(connection, "insert into theme_watchers (ThemeID,WatcherID) values (?,?)", [themeId, user.id], (error, rows)=> {
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

const documentOfGet:interfaces.ApiDocument = {
    url: "/api/themes",
    method: "get",
    documentUrl: "/doc/api/Get themes.html"
};

export function get(request:libs.Request, response:libs.Response) {
    const documentUrl = documentOfGet.documentUrl;

    const type:enums.ThemeQueryType = request.query.type;

    if (type == enums.ThemeQueryType.inOrganization) {
        const organizationId = request.body.organizationId;

        if (!organizationId) {
            services.response.sendParameterMissedError(response, documentUrl);
            return;
        }

        services.currentUser.get(request, response, documentUrl, (error, user)=> {
            if (error) {
                services.response.sendUnauthorizedError(response, error.message, documentUrl);
                return;
            }

            services.organization.getByMemberId(user.id, (error, organizations)=> {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }

                if (libs._.every(organizations, (o:interfaces.Organization)=> o.id != organizationId)) {
                    services.response.sendUnauthorizedError(response, "can not access the organization", documentUrl);
                    return;
                }

                services.theme.getInOrganizationId(organizationId, (error, themes)=> {
                    if (error) {
                        services.response.sendDBAccessError(response, error.message, documentUrl);
                        return;
                    }

                    const result:interfaces.GetThemesResponse = {
                        themes: libs._.map(themes, (t:interfaces.Theme)=> {
                            return {
                                id: t.id,
                                title: t.title,
                                detail: t.detail,
                                organizationId: t.organizationId,
                                createTime: t.createTime.getTime()
                            };
                        })
                    };

                    services.response.sendOK(response, documentUrl, result);
                });
            });
        });
    } else {
        services.response.sendInvalidParameterError(response, documentUrl);
    }
}

export function route(app:libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);

    app[documentOfGet.method](documentOfGet.url, get);
}