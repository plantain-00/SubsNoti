"use strict";

import * as types from "./types";
import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

import * as user from "./controllers/api/user";
import * as userLoggedIn from "./controllers/api/user/logged_in";
import * as userJoined from "./controllers/api/user/joined";
import * as userCreated from "./controllers/api/user/created";
import * as userWatched from "./controllers/api/user/watched";
import * as usersJoined from "./controllers/api/users/joined";
import * as tokens from "./controllers/api/tokens";
import * as organizationsThemes from "./controllers/api/organizations/themes";
import * as themes from "./controllers/api/themes";
import * as organizations from "./controllers/api/organizations";
import * as captcha from "./controllers/api/captcha";
import * as html from "./controllers/html";
import * as version from "./controllers/api/version";

export function route() {
    let app: libs.Application = libs.express();

    app.settings.env = settings.currentEnvironment;

    app.use(libs.compression());

    app.use(libs.cookieParser());

    app.use(libs.bodyParser.json());
    app.use(libs.bodyParser.urlencoded({ extended: true }));

    app.use(libs.cors(settings.cors.get(settings.currentEnvironment)));

    services.rateLimit.route(app);

    // this should be before the `version` route
    services.router.bind(version.documentOfGet, version.get, app);

    services.version.route(app);

    services.router.bind(user.documentOfGet, user.get, app);
    services.router.bind(user.documentOfUpdate, user.update, app);

    services.router.bind(userLoggedIn.documentOfDelete, userLoggedIn.deleteThis, app);

    services.router.bind(userJoined.documentOfGet, userJoined.get, app);
    services.router.bind(usersJoined.documentOfInvite, usersJoined.invite, app);

    services.router.bind(userCreated.documentOfGet, userCreated.get, app);

    services.router.bind(organizations.documentOfCreate, organizations.create, app);

    services.router.bind(userWatched.documentOfWatch, userWatched.watch, app);
    services.router.bind(userWatched.documentOfUnwatch, userWatched.unwatch, app);

    services.router.bind(tokens.documentOfCreate, tokens.create, app);

    services.router.bind(organizationsThemes.documentOfGet, organizationsThemes.get, app);

    services.router.bind(themes.documentOfCreate, themes.create, app);
    services.router.bind(themes.documentOfUpdate, themes.update, app);

    services.router.bind(captcha.documentOfCreate, captcha.create, app);

    services.router.bind(html.documentOfLogin, html.login, app);
    services.router.bind(html.documentOfLoginWithGithub, html.loginWithGithub, app);
    services.router.bind(html.documentOfGithubCode, html.githubCode, app);

    services.mongo.connect();

    services.cache.connect();

    services.email.connect();

    (async () => {
        await services.seed.init();
    })();

    let api = settings.api.get(settings.currentEnvironment);
    let server = app.listen(api.port, api.host, () => {
        console.log(`Server is listening: ${settings.getApi()} and in ${settings.currentEnvironment}`);
    });

    services.push.connect(server);
}
