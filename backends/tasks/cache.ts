'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

services.cache.connect();

services.cache.set("key2", {
    a: "abc",
    b: 123
}, 10);

services.cache.getAsync("key2", "b").then(reply=> {
    console.log(reply);
}, error=> {
    console.log(error);
});
