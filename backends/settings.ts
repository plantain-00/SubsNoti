"use strict";

import * as types from "../common/types";

export let config: types.SettingsInterface = {
    currentEnvironment: types.environment.development,
    db: {
        host: "",
        user: "",
        password: "",
        database: "",
    },
    website: {
        port: 8888,
        innerHostName: "0.0.0.0",
        outerHostName: "localhost",
    },
    smtp: {
        host: "",
        name: "",
        password: "",
    },
    redis: {
        host: "",
        port: 6379,
        options: {
            auth_pass: ""
        },
    },
    mongodb: {
        url: "",
        user: "",
        password: "",
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
        emailFrequency: "email_frequency_",
        userCaptcha: "user_captcha_",
        userCaptchaFrequency: "user_captcha_frequency_",
        rateLimit: {
            userId: "rateLimit_userId_",
            ip: "rateLimit_ip_",
        },
    },
    defaultItemLimit: 10,
    imageServer: {
        port: 7777,
        innerHostName: "0.0.0.0",
        outerHostName: "localhost",
    },
    ipWhiteList: [
        "127.0.0.1"
    ],
    imageUploader: {
        port: 9999,
        innerHostName: "0.0.0.0",
        outerHostName: "localhost",
    },
    avatar: "avatar-",
    cors: {
        methods: "GET,PUT,POST",
        credentials: true,
        origin: [
            "http://localhost:8888"
        ],
    },
    rateLimit: {
        user: 5000,
        ip: 60,
    },
};

try {
    let secret = require("./secret");
    secret.load(config);
} catch (e) {
    console.log(e);
}
