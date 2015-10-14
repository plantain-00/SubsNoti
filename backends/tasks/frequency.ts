'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

services.cache.connect();

services.frequency.limit("test", 2).then(() => {
    return services.frequency.limit("test", 2).then(() => {
        console.log(true);
    }, error=> {
        console.log(error);
    });
}, error=> {
    console.log(error);
});
