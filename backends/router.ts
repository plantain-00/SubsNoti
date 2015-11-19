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
import * as tokens from "./controllers/tokens";
import * as organizationsThemes from "./controllers/organizations/themes";
import * as themes from "./controllers/themes";
import * as organizations from "./controllers/organizations";
import * as captcha from "./controllers/captcha";

export function route(app: libs.Application) {
    services.version.route(app);

    services.router.bind(user.documentOfGet, user.get, app);
    services.router.bind(user.documentOfUpdate, user.update, app);

    services.router.bind(userLoggedIn.documentOfGet, userLoggedIn.get, app);
    services.router.bind(userLoggedIn.documentOfDelete, userLoggedIn.deleteThis, app);

    services.router.bind(userJoined.documentOfGet, userJoined.get, app);
    services.router.bind(userJoined.documentOfInvite, userJoined.invite, app);

    services.router.bind(userCreated.documentOfGet, userCreated.get, app);

    services.router.bind(organizations.documentOfCreate, organizations.create, app);

    services.router.bind(userThemeWatched.documentOfWatch, userThemeWatched.watch, app);
    services.router.bind(userThemeWatched.documentOfUnwatch, userThemeWatched.unwatch, app);

    services.router.bind(tokens.documentOfCreate, tokens.create, app);

    services.router.bind(organizationsThemes.documentOfGet, organizationsThemes.get, app);

    services.router.bind(themes.documentOfCreate, themes.create, app);
    services.router.bind(themes.documentOfUpdate, themes.update, app);

    services.router.bind(captcha.documentOfCreate, captcha.create, app);

    services.router.bindObsolete(userJoined.documentOfUserJoinedOrganization, userJoined.get, app);
    services.router.bindObsolete(userCreated.documentOfUserCreatedOrganizations, userCreated.get, app);
    services.router.bindObsolete(userJoined.documentOfObsoleteInvite, userJoined.invite, app);
    services.router.bindObsolete(tokens.documentOfSendToken, tokens.create, app);
}
