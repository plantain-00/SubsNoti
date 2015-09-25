import {SettingsInterface} from "./SettingsInterface";

export const config: SettingsInterface = {
    /*
     * production: "production"
     * testing: "testing"
     * development: "development"
     * */
    environment: "development",
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
    }
};

try {
    const secret = require("./secret");
    secret.load(config);
} catch (e) {
    console.log(e);
}