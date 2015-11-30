"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Case {
    request: {
        url: string;
        method?: "get" | "post" | "put" | "delete";
        headers?: any;
        dataType?: types.ResponseType;
    };
    response: {
        body: any;
        cookie?: any;
        headers?: any;
        statusCode?: types.StatusCode;
    };
}

let cases: Case[] = require("./cases.json");

let apiUrl = settings.getApi();

(async () => {
    for (let c of cases) {
        c.request.url = apiUrl + c.request.url;

        if (!c.request.method) {
            c.request.method = "get";
        }

        if (!c.request.dataType) {
            c.request.dataType = types.responseType.json;
        }

        if (!c.response.statusCode) {
            c.response.statusCode = types.StatusCode.OK;
        }

        if (c.request.method === "get") {
            let response = await services.request.getAsync(c.request.url, c.request.dataType);
        }
    }
})();


