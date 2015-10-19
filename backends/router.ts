'use strict';

import * as libs from "./libs";
import * as settings from "./settings";

import * as enums from "../common/enums";
import * as interfaces from "../common/interfaces";

import * as services from "./services";

import * as user from "./controllers/user";
import * as userLoggedIn from "./controllers/user/logged_in";
import * as userJoinedOrganizations from "./controllers/user/joined/organizations";
import * as userOrganizations from "./controllers/user/organizations";
import * as userThemes from "./controllers/user/themes";
import * as userThemeWatched from "./controllers/user/themes/watched";

import * as tokenSent from "./controllers/token_sent";

import * as organizationsThemes from "./controllers/organizations/themes";

import * as themes from "./controllers/themes";

export function route(app: libs.Application) {
    function bind(document: { url: string; method: string; documentUrl: string }, handler: (request: libs.Request, response: libs.Response) => void) {
        app[document.method](document.url, handler);
    }

    bind(user.documentOfGet, user.get);

    bind(userLoggedIn.documentOfGet, userLoggedIn.get);
    bind(userLoggedIn.documentOfDelete, userLoggedIn.deleteThis);

    bind(userJoinedOrganizations.documentOfGet, userJoinedOrganizations.get);

    bind(userOrganizations.documentOfCreate, userOrganizations.create);

    bind(userThemes.documentOfCreate, userThemes.create);

    bind(userThemeWatched.documentOfWatch, userThemeWatched.watch);
    bind(userThemeWatched.documentOfUnwatch, userThemeWatched.unwatch);

    bind(tokenSent.documentOfCreate, tokenSent.create);

    bind(organizationsThemes.documentOfGet, organizationsThemes.get);

    bind(themes.documentOfUpdate, themes.update);
}
