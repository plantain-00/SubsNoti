import * as environment from "../environment";

export const config = {
	environment: environment.developmentEnvironment
}

try {
    const secret = require("./secret");
    secret.load(config);
} catch (e) {
    console.log(e);
}