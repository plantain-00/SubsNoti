"use strict";

import * as libs from "../libs";
import * as integration from "./integration";

let responses = {};

integration.operate = (caseName, body) => {
    responses[caseName] = body;
    console.log(`case ${caseName} is done.`);
    return Promise.resolve();
};

integration.run().then(() => {
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
