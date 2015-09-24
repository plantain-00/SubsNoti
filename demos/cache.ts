import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

services.cache.set("key2", {
    a: "abc",
    b: 123
}, 10);

services.cache.get("key2", "b", (error, reply)=> {
    if (error) {
        console.log(error);
        return;
    }

    console.log(reply);
});