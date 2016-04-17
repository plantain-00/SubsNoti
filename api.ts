import * as types from "./share/types";
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
import * as scopes from "./controllers/api/scopes";
import * as userRegistered from "./controllers/api/user/registered";
import * as userAuthorized from "./controllers/api/user/authorized";
import * as userRegisteredClientSecret from "./controllers/api/user/registered/client_secret";
import * as userAccessTokens from "./controllers/api/user/access_tokens";
import * as userAccessTokensValue from "./controllers/api/user/access_tokens/value";
import * as accessTokens from "./controllers/api/access_tokens";
import * as userAccessTokenCode from "./controllers/api/user/access_tokens/code";
import * as applications from "./controllers/api/applications";

const app = libs.express();

app.settings.env = settings.currentEnvironment;

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));

app.use(libs.cors(settings.cors));

services.version.route(app);
services.rateLimit.route(app);

services.router.bind(version.documentOfGet, version.get, app);

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
services.router.bind(html.documentOfAuthorize, html.authorize, app);

services.router.bind(scopes.documentOfGet, scopes.get, app);

services.router.bind(userRegistered.documentOfGet, userRegistered.get, app);
services.router.bind(userRegistered.documentOfCreate, userRegistered.create, app);
services.router.bind(userRegistered.documentOfUpdate, userRegistered.update, app);
services.router.bind(userRegistered.documentOfRemove, userRegistered.remove, app);

services.router.bind(userAuthorized.documentOfGet, userAuthorized.get, app);
services.router.bind(userAuthorized.documentOfRemove, userAuthorized.remove, app);

services.router.bind(userRegisteredClientSecret.documentOfReset, userRegisteredClientSecret.reset, app);

services.router.bind(userAccessTokens.documentOfGet, userAccessTokens.get, app);
services.router.bind(userAccessTokens.documentOfCreate, userAccessTokens.create, app);
services.router.bind(userAccessTokens.documentOfUpdate, userAccessTokens.update, app);
services.router.bind(userAccessTokens.documentOfRemove, userAccessTokens.remove, app);

services.router.bind(userAccessTokensValue.documentOfRegenerate, userAccessTokensValue.regenerate, app);

services.router.bind(accessTokens.documentOfCreate, accessTokens.create, app);

services.router.bind(userAccessTokenCode.documentOfConfirm, userAccessTokenCode.confirm, app);

services.router.bind(applications.documentOfGet, applications.get, app);

services.mongo.connect();

services.redis.connect();

services.email.connect();

services.seed.init().then(() => {
    services.logger.logInfo(`initialize successfully.`);
});

const server = app.listen(settings.apiPort, "localhost", () => {
    services.logger.logInfo(`api Server is listening: ${settings.apiPort} and in ${settings.currentEnvironment}`);
});

services.push.connect(server);
