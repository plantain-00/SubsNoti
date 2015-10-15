'use strict';

import {SettingsInterface} from "./SettingsInterface";
import * as environment from "../common/environment";

export let config: SettingsInterface = {
    environment: environment.developmentEnvironment,
    db: {
        host: '',
        user: '',
        password: '',
        database: ''
    },
    website: {
        port: 8888,
        innerHostName: "0.0.0.0",
        outerHostName: "localhost"
    },
    smtp: {
        host: "",
        name: "",
        password: ""
    },
    redis: {
        host: "",
        port: 6379,
        options: {
            auth_pass: ""
        }
    },
    mongodb: {
        url: "",
        user: "",
        password: ""
    },
    urls: {
        login: "/api/logged_in"
    },
    maxOrganizationNumberUserCanCreate: 3,
    cookieKeys: {
        authenticationCredential: "authentication_credential"
    },
    cacheKeys: {
        user: "user_",
        frequency: "frequency_"
    }
};

try {
    let secret = require("./secret");
    secret.load(config);
} catch (e) {
    console.log(e);
}
