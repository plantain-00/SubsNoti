"use strict";

import * as types from "../common/types";

import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

import * as user from "./controllers/user";
import * as userLoggedIn from "./controllers/user/logged_in";
import * as userJoined from "./controllers/user/joined";
import * as userCreated from "./controllers/user/created";
import * as userThemeWatched from "./controllers/user/themes/watched";
import * as tokenSent from "./controllers/token_sent";
import * as organizationsThemes from "./controllers/organizations/themes";
import * as themes from "./controllers/themes";
import * as organizations from "./controllers/organizations";
import * as captcha from "./controllers/captcha";

export function route(app: libs.Application) {
    function bind(document: types.Document, handler: (request: libs.Request, response: libs.Response) => void) {
        app[document.method](document.url, handler);
    }
    
    services.version.route(app);

    bind(user.documentOfGet, user.get);
    bind(user.documentOfUpdate, user.update);

    bind(userLoggedIn.documentOfGet, userLoggedIn.get);
    bind(userLoggedIn.documentOfDelete, userLoggedIn.deleteThis);

    bind(userJoined.documentOfGet, userJoined.get);
    bind(userJoined.documentOfInvite, userJoined.invite);

    bind(userCreated.documentOfGet, userCreated.get);

    bind(organizations.documentOfCreate, organizations.create);

    bind(userThemeWatched.documentOfWatch, userThemeWatched.watch);
    bind(userThemeWatched.documentOfUnwatch, userThemeWatched.unwatch);

    bind(tokenSent.documentOfCreate, tokenSent.create);

    bind(organizationsThemes.documentOfGet, organizationsThemes.get);

    bind(themes.documentOfCreate, themes.create);
    bind(themes.documentOfUpdate, themes.update);

    bind(captcha.documentOfCreate, captcha.create);

    app.get("/api/user/joined/organizations", (request: libs.Request, response: libs.Response) => {
        if (services.version.match(request.v, ">=0.12.0", "2015-11-25")) {
            response.status(404);
        } else {
            userJoined.get(request, response);
        }
    });

    app.get("/api/user/created/organizations", (request: libs.Request, response: libs.Response) => {
        if (services.version.match(request.v, ">=0.12.1", "2015-11-25")) {
            response.status(404);
        } else {
            userCreated.get(request, response);
        }
    });
    
    app.get("/api/organizations/:organization_id/user/:user_email/joined", (request: libs.Request, response: libs.Response) => {
        if (services.version.match(request.v, ">=0.12.2", "2015-11-25")) {
            response.status(404);
        } else {
            userJoined.invite(request, response);
        }
    });
}
