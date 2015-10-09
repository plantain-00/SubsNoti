'use strict';

import * as libs from "../../../libs";
import * as settings from "../../../settings";

import * as enums from "../../../../common/enums";
import * as interfaces from "../../../../common/interfaces";

import * as services from "../../../services";

let documentOfWatch = {
    url: "/api/user/themes/:theme_id/watched",
    method: "post",
    documentUrl: "/doc/api/Watch a theme.html"
};

export function watch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfWatch.documentUrl;

    let themeId = request.params.theme_id;

    if (!themeId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    services.user.getCurrent(request, documentUrl).then(user=> {
        return services.watched.canWatch(user.id, themeId).then(can=> {
            if (!can) {
                services.response.sendUnauthorizedError(response, "you are not in the organization where the theme belong to", documentUrl);
            }
            else {
                return services.db.accessAsync("select * from theme_watchers where ThemeID = ? and WatcherID = ?", [themeId, user.id]).then(rows=> {
                    if (rows.length > 0) {
                        services.response.sendCreatedOrModified(response, documentUrl);
                    }
                    else {
                        return services.db.accessAsync("insert into theme_watchers (ThemeID,WatcherID) values(?,?)", [themeId, user.id]).then(rows=> {
                            services.response.sendCreatedOrModified(response, documentUrl);
                        });
                    }
                });
            }
        }, error=> {
            services.response.sendDBAccessError(response, error.message, documentUrl);
        })
    }, error=> {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    });
}

let documentOfUnwatch = {
    url: "/api/user/themes/:theme_id/watched",
    method: "delete",
    documentUrl: "/doc/api/Unwatch a theme.html"
};

export function unwatch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfUnwatch.documentUrl;

    let themeId = request.params.theme_id;

    if (!themeId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    services.user.getCurrent(request, documentUrl).then(user=> {
        return services.watched.canWatch(user.id, themeId).then(can=> {
            if (!can) {
                services.response.sendUnauthorizedError(response, "you are not in the organization where the theme belong to", documentUrl);
            }
            else {
                return services.db.accessAsync("delete from theme_watchers where ThemeID = ? and WatcherID = ?", [themeId, user.id]).then(rows=> {
                    services.response.sendDeleted(response, documentUrl);
                });
            }
        }, error=> {
            services.response.sendDBAccessError(response, error.message, documentUrl);
        })
    }, error=> {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    });
}

export function route(app: libs.Application) {
    app[documentOfUnwatch.method](documentOfUnwatch.url, unwatch);
    services.response.notGet(app, documentOfUnwatch);

    app[documentOfWatch.method](documentOfWatch.url, watch);
    services.response.notGet(app, documentOfWatch);
}