const exit = require("exit");
import * as libs from "../libs";
import * as integration from "./integration";

const baseline: any[] = require("./baseline.json");

let index = 1;

integration.setOperation(async (caseName, body) => {
    const expected = JSON.stringify(baseline[caseName]);
    const actually = JSON.stringify(body);
    if (expected !== actually) {
        throw new Error(`error in case: "${caseName}" expected: ${expected} /n.but actually: ${actually}`);
    }
    console.log(libs.colors.green(`${index++}: case "${caseName}" is passed.`));
});

(async () => {
    try {
        await integration.run();
        console.log(libs.colors.green("all test cases are passed!"));
    } catch (error) {
        console.log(libs.colors.red("error:"));
        console.log(error);
        exit(1);
    }
})();
