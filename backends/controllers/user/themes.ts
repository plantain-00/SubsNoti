'use strict';

import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../../common/enums";
import * as interfaces from "../../../common/interfaces";

import * as services from "../../services";

let documentOfCreate = {
    url: "/api/user/themes",
    method: "post",
    documentUrl: "/doc/api/Create a theme.html"
};

export function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    if (services.contentType.isInvalid(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    let organizationId = request.body.organizationId;

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

    let themeDetail = request.body.themeDetail;

    services.user.getCurrent(request, documentUrl).then(user=> {
        return services.db.beginTransactionAsync().then(connection=> {
            return services.db.insertInTransactionAsync(connection, "insert into themes (Title,Detail,OrganizationID,Status,CreatorID,CreateTime) values (?,?,?,?,?,now())", [themeTitle, themeDetail, organizationId, enums.ThemeStatus.normal, user.id]).then(rows=> {
                let themeId = rows.insertId;

                return services.db.accessInTransactionAsync(connection, "insert into theme_owners (ThemeID,OwnerID) values (?,?)", [themeId, user.id]).then(rows=> {
                    return services.db.accessInTransactionAsync(connection, "insert into theme_watchers (ThemeID,WatcherID) values (?,?)", [themeId, user.id]).then(rows=> {
                        return services.db.endTransactionAsync(connection).then(() => {
                            services.logger.log(documentOfCreate.url, request);
                            services.response.sendCreatedOrModified(response, documentUrl);
                        });
                    });
                });
            });
        }, error=> {
            services.response.sendDBAccessError(response, error.message, documentUrl);
        });
    }, error=> {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    });
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}