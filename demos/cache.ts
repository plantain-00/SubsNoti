import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

services.cache.client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, settings.config.redis.options);
services.cache.client.on("error", error=> {
    console.log(error);
});

services.cache.set("key2", {
    a: "abc",
    b: 123
}, 10);

services.cache.getAsync("key2", "b").then(reply=> {
    console.log(reply);
}, error=> {
    console.log(error);
});