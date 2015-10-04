import * as environment from "../environment";

export let config = {
	environment: environment.developmentEnvironment
}

try {
    let secret = require("./secret");
    secret.load(config);
} catch (e) {
    console.log(e);
}