"use strict";

import * as types from "../common/types";

import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

let app: libs.Application = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

app.use(libs.express.static(libs.path.join(__dirname, "../images")));

app.listen(settings.config.imageServer.port, settings.config.imageServer.innerHostName, () => {
    console.log(`Image server is listening: ${settings.config.imageServer.innerHostName}:${settings.config.imageServer.port}`);
});
