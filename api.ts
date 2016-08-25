import * as libs from "./libs";
import * as services from "./services";

const app = libs.express();

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));

app.use(libs.helmet());

app.disable("x-powered-by");

app.set("trust proxy", true);

services.version.route(app);
services.rateLimit.route(app);

services.router.bind(services.version.documentOfGet, services.version.get, app);

services.router.bind(services.user.documentOfGet, services.user.get, app);
services.router.bind(services.user.documentOfUpdate, services.user.update, app);

services.router.bind(services.tokens.documentOfDelete, services.tokens.deleteThis, app);

services.router.bind(services.joined.documentOfGet, services.joined.get, app);
services.router.bind(services.joined.documentOfInvite, services.joined.invite, app);

services.router.bind(services.organizations.documentOfGetCreated, services.organizations.getCreated, app);

services.router.bind(services.organizations.documentOfCreate, services.organizations.create, app);

services.router.bind(services.watched.documentOfWatch, services.watched.watch, app);
services.router.bind(services.watched.documentOfUnwatch, services.watched.unwatch, app);

services.router.bind(services.tokens.documentOfCreate, services.tokens.create, app);

services.router.bind(services.theme.documentOfGet, services.theme.get, app);

services.router.bind(services.theme.documentOfCreate, services.theme.create, app);
services.router.bind(services.theme.documentOfUpdate, services.theme.update, app);

services.router.bind(services.captcha.documentOfCreate, services.captcha.create, app);

services.router.bind(services.html.documentOfLogin, services.html.login, app);
services.router.bind(services.html.documentOfLoginWithGithub, services.html.loginWithGithub, app);
services.router.bind(services.html.documentOfGithubCode, services.html.githubCode, app);
services.router.bind(services.html.documentOfAuthorize, services.html.authorize, app);

services.router.bind(services.scope.documentOfGet, services.scope.get, app);

services.router.bind(services.applications.documentOfGetRegistered, services.applications.getRegistered, app);
services.router.bind(services.applications.documentOfCreate, services.applications.create, app);
services.router.bind(services.applications.documentOfUpdate, services.applications.update, app);
services.router.bind(services.applications.documentOfRemove, services.applications.remove, app);

services.router.bind(services.applications.documentOfGetAuthorized, services.applications.getAuthorized, app);
services.router.bind(services.applications.documentOfRemoveAuthorized, services.applications.removeAuthorized, app);

services.router.bind(services.applications.documentOfReset, services.applications.reset, app);

services.router.bind(services.access_tokens.documentOfGet, services.access_tokens.get, app);
services.router.bind(services.access_tokens.documentOfCreate, services.access_tokens.create, app);
services.router.bind(services.access_tokens.documentOfUpdate, services.access_tokens.update, app);
services.router.bind(services.access_tokens.documentOfRemove, services.access_tokens.remove, app);

services.router.bind(services.access_tokens.documentOfRegenerate, services.access_tokens.regenerate, app);

services.router.bind(services.access_tokens.documentOfCreateForApplication, services.access_tokens.createForApplication, app);

services.router.bind(services.access_tokens.documentOfConfirm, services.access_tokens.confirm, app);

services.router.bind(services.applications.documentOfGet, services.applications.get, app);

services.mongo.connect();

services.redis.connect();

services.email.connect();

services.seed.init().then(() => {
    services.logger.logInfo(`initialize successfully.`);
});

const argv = libs.minimist(process.argv.slice(2));
const port = argv["p"] || 9998;
const host = argv["h"] || "localhost";

const server = app.listen(port, host, () => {
    services.logger.logInfo(`api Server is listening: ${host}:${port} and in ${services.settings.currentEnvironment}`);
});

services.push.connect(server);
