const exit = require("exit");
import * as libs from "../libs";
import * as services from "../services";
import * as integration from "./integration";

const responses = {};

integration.setOperation(async (caseName, body) => {
    responses[caseName] = body;
    services.utils.green(`case "${caseName}" is done.`);
});

(async () => {
    try {
        await integration.run();
        libs.fs.writeFile("./tests/baseline.json", JSON.stringify(responses, null, "    "), error => {
            if (error) {
                services.utils.red("error:");
                console.log(error);
            } else {
                services.utils.green("all test cases are rebuilt!");
            }
        });
    } catch (error) {
        services.utils.red("error:");
        console.log(error);
        exit(1);
    }
})();
