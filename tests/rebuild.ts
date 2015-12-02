"use strict";

import * as libs from "../libs";
import * as integration from "./integration";

import CaseName = integration.CaseName;

let responses = {};

integration.run((caseName, response) => {
    responses[caseName] = response;
    console.log(`case ${caseName} is done.`);
    return Promise.resolve();
}).then(() => {
    libs.fs.writeFile("./tests/baseline.json", JSON.stringify(responses, null, "    "), error => {
        if (error) {
            console.log(error);
        } else {
            console.log("all test cases are rebuilt!");
        }
    });
}).catch(error => {
    console.log(error);
});
