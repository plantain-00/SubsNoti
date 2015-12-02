"use strict";

import * as libs from "../libs";
import * as integration from "./integration";

import CaseName = integration.CaseName;

let responses = {};

integration.run((caseName, response) => {
    responses[caseName] = response;
    return Promise.resolve();
}).then(() => {
    libs.fs.writeFile("./tests/baseline.json", JSON.stringify(responses, null, "    "), error => {
        if (error) {
            console.log(error);
        }
    });
}).catch(error => {
    console.log(error);
});
