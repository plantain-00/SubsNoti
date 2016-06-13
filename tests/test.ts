const exit = require("exit");
import * as libs from "../libs";
import * as services from "../services";
import * as integration from "./integration";

const baseline: any[] = require("./baseline.json");

let index = 1;

integration.setOperation(async (caseName, body) => {
    const expected = JSON.stringify(baseline[caseName]);
    const actually = JSON.stringify(body);
    services.utils.assert(expected === actually, `error in case: "${caseName}" expected: ${expected} /n.but actually: ${actually}`);
    services.utils.green(`${index++}: case "${caseName}" is passed.`);
});

(async () => {
    try {
        await integration.run();
        services.utils.green("all test cases are passed!");
    } catch (error) {
        services.utils.red("error:");
        console.log(error);
        exit(1);
    }
})();
