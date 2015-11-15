"use strict";

import * as types from "../common/types";

import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

import * as user from "./controllers/user";
import * as userLoggedIn from "./controllers/user/logged_in";
import * as userJoinedOrganizations from "./controllers/user/joined/organizations";
import * as userCreatedOrganizations from "./controllers/user/created/organizations";
import * as userThemeWatched from "./controllers/user/themes/watched";
import * as tokenSent from "./controllers/token_sent";
import * as organizationsThemes from "./controllers/organizations/themes";
import * as themes from "./controllers/themes";
import * as organizations from "./controllers/organizations";
import * as organizationsUsersJoined from "./controllers/organizations/users/joined";
import * as captcha from "./controllers/captcha";

export function route(app: libs.Application) {
    function bind(document: types.Document, handler: (request: libs.Request, response: libs.Response) => void) {
        app[document.method](document.url, handler);
    }

    app.all("/api/*", (request: libs.Request, response: libs.Response, next) => {
        let v = libs.validator.trim(request.query.v);

        if (v === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("v"), "/doc/api/Parameters.html");
            return;
        }

        if (!libs.semver.valid(v)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("v"), "/doc/api/Parameters.html");
            return;
        }

        request.v = v;
        next();
    });

    bind(user.documentOfGet, user.get);
    bind(user.documentOfUpdate, user.update);

    bind(userLoggedIn.documentOfGet, userLoggedIn.get);
    bind(userLoggedIn.documentOfDelete, userLoggedIn.deleteThis);

    bind(userJoinedOrganizations.documentOfGet, userJoinedOrganizations.get);

    bind(userCreatedOrganizations.documentOfGet, userCreatedOrganizations.get);

    bind(organizations.documentOfCreate, organizations.create);

    bind(userThemeWatched.documentOfWatch, userThemeWatched.watch);
    bind(userThemeWatched.documentOfUnwatch, userThemeWatched.unwatch);

    bind(tokenSent.documentOfCreate, tokenSent.create);

    bind(organizationsThemes.documentOfGet, organizationsThemes.get);

    bind(themes.documentOfCreate, themes.create);
    bind(themes.documentOfUpdate, themes.update);

    bind(organizationsUsersJoined.documentOfInvite, organizationsUsersJoined.invite);

    bind(captcha.documentOfCreate, captcha.create);
}
