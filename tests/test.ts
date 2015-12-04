"use strict";

import * as libs from "../libs";
import * as integration from "./integration";

let baseline: any[] = require("./baseline.json");

integration.operate = (caseName, body) => {
    let expected = JSON.stringify(baseline[caseName]);
    let actually = JSON.stringify(body);
    if (expected !== actually) {
        throw new Error(`error in case: "${caseName}" expected: ${expected} /n.but actually: ${actually}`);
    }
    console.log(`case "${caseName}" is passed.`);
    return Promise.resolve();
};

integration.run().then(() => {
    console.log("all test cases are passed!");
}).catch(error => {
    console.log(error);
});
