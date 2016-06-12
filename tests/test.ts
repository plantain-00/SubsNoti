const exit = require("exit");
import * as libs from "../libs";
import * as integration from "./integration";

const baseline: any[] = require("./baseline.json");

let index = 1;

integration.setOperation(async (caseName, body) => {
    const expected = JSON.stringify(baseline[caseName]);
    const actually = JSON.stringify(body);
    libs.assert(expected === actually, `error in case: "${caseName}" expected: ${expected} /n.but actually: ${actually}`);
    libs.green(`${index++}: case "${caseName}" is passed.`);
});

(async () => {
    try {
        await integration.run();
        libs.green("all test cases are passed!");
    } catch (error) {
        libs.red("error:");
        console.log(error);
        exit(1);
    }
})();
