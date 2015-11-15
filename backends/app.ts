"use strict";

import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

let app: libs.Application = libs.express();

app.settings.env = settings.config.currentEnvironment;

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));

app.use(libs.express.static(libs.path.join(__dirname, "../public")));

import * as router from "./router";
router.route(app);

services.mongo.connect();

services.cache.connect();

(async() => {
    await services.seed.init();
})();

app.listen(settings.config.website.port, settings.config.website.innerHostName, () => {
    console.log(`Server is listening: ${settings.config.website.innerHostName}:${settings.config.website.port}`);
});
