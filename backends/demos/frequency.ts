import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

services.cache.client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, settings.config.redis.options);
services.cache.client.on("error", error=> {
    console.log(error);
});

services.frequency.limit("test", 2).then(() => {
    return services.frequency.limit("test", 2).then(() => {
        console.log(true);
    }, error=> {
        console.log(error);
    });
}, error=> {
    console.log(error);
});