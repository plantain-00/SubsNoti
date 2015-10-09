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

export function route(app: libs.Application) {
    user.route(app);
    userLoggedIn.route(app);
    userJoinedOrganizations.route(app);
    userOrganizations.route(app);
    userThemes.route(app);
    userThemeWatched.route(app);

    tokenSent.route(app);

    organizationsThemes.route(app);
}
