"use strict";

let exit = require("exit");
import * as libs from "../libs";
import * as integration from "./integration";

let responses = {};

integration.operate = (caseName, body) => {
    responses[caseName] = body;
    console.log(libs.colors.green(`case "${caseName}" is done.`));
    return Promise.resolve();
};

integration.run().then(() => {
    libs.fs.writeFile("./tests/baseline.json", JSON.stringify(responses, null, "    "), error => {
        if (error) {
            console.log(libs.colors.red("error:"));
            console.log(error);
        } else {
            console.log(libs.colors.green("all test cases are rebuilt!"));
        }
    });
}).catch(error => {
    console.log(libs.colors.red("error:"));
    console.log(error);
    exit(1);
});
