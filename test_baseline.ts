"use strict";

import * as types from "./types";
import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

let cases: types.Case[] = require("./cases.json");

let apiUrl = settings.getApi();

(async () => {
    try {
        for (let c of cases) {
            c.request.url = apiUrl + c.request.url;

            if (!c.request.method) {
                c.request.method = "get";
            }

            if (!c.dataType) {
                c.dataType = types.responseType.json;
            }

            if (!c.response.statusCode) {
                c.response.statusCode = types.StatusCode.OK;
            }

            console.log(`starting: ${c.request.method} ${c.request.url}`);

            let response = await services.request.request(c.request);
            if (response.response.statusCode !== c.response.statusCode) {
                console.log(`statusCode expects ${c.response.statusCode} but actually ${response.response.statusCode}`);
                return;
            }

            let body = JSON.stringify(c.response.body);
            if (response.body !== body) {
                console.log(`body expects ${body} but actually ${response.body}`);
                return;
            }
        }
    } catch (error) {
        console.log(error);
    }
})();
