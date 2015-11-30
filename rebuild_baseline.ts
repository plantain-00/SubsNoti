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

            console.log(`starting: ${c.request.method} ${c.request.url}`);

            let response = await services.request.request(c.request);
            c.response.statusCode = response.response.statusCode;
            c.response.body = JSON.parse(response.body);

            if (c.request.method === "get") {
                c.request.method = undefined;
            }

            if (c.dataType === types.responseType.json) {
                c.dataType = undefined;
            }

            if (c.response.statusCode === types.StatusCode.OK) {
                c.response.statusCode = undefined;
            }
        }

        libs.fs.writeFile("./cases.json", JSON.stringify(cases), error => {
            if (error) {
                console.log(error);
            }
        });
    } catch (error) {
        console.log(error);
    }
})();
