const exit = require("exit");
import * as libs from "../libs";
import * as integration from "./integration";

const responses = {};

integration.setOperation(async (caseName, body) => {
    responses[caseName] = body;
    libs.green(`case "${caseName}" is done.`);
});

(async () => {
    try {
        await integration.run();
        libs.fs.writeFile("./tests/baseline.json", JSON.stringify(responses, null, "    "), error => {
            if (error) {
                libs.red("error:");
                console.log(error);
            } else {
                libs.green("all test cases are rebuilt!");
            }
        });
    } catch (error) {
        libs.red("error:");
        console.log(error);
        exit(1);
    }
})();
