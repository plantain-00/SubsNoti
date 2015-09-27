import * as libs from "./libs";
import * as settings from "./settings";

import * as services from "./services/services";

const app: libs.Application = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));

app.use(libs.express.static(libs.path.join(__dirname, 'public')));

import * as router from "./router";
router.route(app);

services.mongo.connectAsync().then(logs=> {

}, error=> {
    console.log(error);
});

services.cache.client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, settings.config.redis.options);
services.cache.client.on("error", error=> {
    console.log(error);
});

app.listen(settings.config.website.port, settings.config.website.innerHostName, () => {
    console.log(`Server has started at port: ${settings.config.website.port}`);
});