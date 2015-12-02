"use strict";

import * as faker from "faker";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

(async () => {
    try {
        let versionResponse = await services.request.getAsync<types.Response>(settings.getApi() + "/api/version", "json");
        console.log(JSON.stringify(versionResponse.body, null, "    "));
    } catch (error) {
        console.log(error);
    }
})();
