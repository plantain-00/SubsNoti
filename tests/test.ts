"use strict";

import * as libs from "../libs";
import * as integration from "./integration";

import CaseName = integration.CaseName;

let baseline: any[] = require("./baseline.json");

integration.run((caseName, response) => {
    let expected = JSON.stringify(baseline[caseName]);
    let actually = JSON.stringify(response);
    if (expected !== actually) {
        throw new Error(`error in case: ${caseName} expected: ${expected} actually: ${actually}`);
    }
    console.log(`case ${caseName} is passed.`);
    return Promise.resolve();
}).then(() => {
    console.log("all test cases are passed!");
}).catch(error => {
    console.log(error);
});
