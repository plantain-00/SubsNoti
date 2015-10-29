'use strict';

import * as libs from "./libs";
import * as settings from "./settings";

let app: libs.Application = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

app.use(libs.express.static(libs.path.join(__dirname, '../images')));

app.post("/api/temperary/images", (request: libs.Request, response: libs.Response) => {
    
});

app.listen(settings.config.imageServer.port, settings.config.imageServer.innerHostName, () => {
    console.log(`Image server has started at port: ${settings.config.imageServer.port}`);
});
