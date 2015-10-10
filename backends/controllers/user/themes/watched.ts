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

export async function watch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfWatch.documentUrl;

    let themeId = request.params.theme_id;

    if (!themeId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    try {
        let user = await services.user.getCurrent(request, documentUrl);
        let can = await services.watched.canWatch(user.id, themeId);
        if (!can) {
            services.response.sendUnauthorizedError(response, "you are not in the organization where the theme belong to", documentUrl);
        }
        else {
            let rows = await services.db.queryAsync("select * from theme_watchers where ThemeID = ? and WatcherID = ?", [themeId, user.id]);
            if (rows.length > 0) {
                services.response.sendCreatedOrModified(response, documentUrl);
            }
            else {
                await services.db.queryAsync("insert into theme_watchers (ThemeID,WatcherID) values(?,?)", [themeId, user.id]);
                services.response.sendCreatedOrModified(response, documentUrl);
            }
        }
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

let documentOfUnwatch = {
    url: "/api/user/themes/:theme_id/watched",
    method: "delete",
    documentUrl: "/doc/api/Unwatch a theme.html"
};

export async function unwatch(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfUnwatch.documentUrl;

    let themeId = request.params.theme_id;

    if (!themeId) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    try {
        let user = await services.user.getCurrent(request, documentUrl);
        let can = await services.watched.canWatch(user.id, themeId);
        if (!can) {
            services.response.sendUnauthorizedError(response, "you are not in the organization where the theme belong to", documentUrl);
        }
        else {
            let rows = await services.db.queryAsync("delete from theme_watchers where ThemeID = ? and WatcherID = ?", [themeId, user.id]);
            services.response.sendDeleted(response, documentUrl);
        }
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

export function route(app: libs.Application) {
    app[documentOfUnwatch.method](documentOfUnwatch.url, unwatch);
    services.response.notGet(app, documentOfUnwatch);

    app[documentOfWatch.method](documentOfWatch.url, watch);
    services.response.notGet(app, documentOfWatch);
}
