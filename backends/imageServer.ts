"use strict";

import * as libs from "./libs";
import * as settings from "./settings";

let app: libs.Application = libs.express();

app.settings.env = settings.config.currentEnvironment;

app.use(libs.compression());

app.use(libs.express.static(libs.path.join(__dirname, "../images")));

app.listen(settings.config.imageServer.port, settings.config.imageServer.innerHostName, () => {
    console.log(`Image server is listening: ${settings.config.imageServer.innerHostName}:${settings.config.imageServer.port}`);
});
