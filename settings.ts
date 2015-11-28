"use strict";

import * as types from "./types";

export let config: types.SettingsInterface = {
    currentEnvironment: types.environment.development,
    db: {
        host: "",
        user: "",
        password: "",
        database: "",
    },
    website: {
        port: 9998,
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
        login: "/login_with_authentication_credential"
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
            contentCreation: "rateLimit_contentCreation_",
        },
        githubLoginCode: "github_login_",
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
        methods: "GET,PUT,POST,DELETE",
        credentials: true,
        origin: [
            "http://localhost:8888",
            "http://localhost:80",
        ],
    },
    rateLimit: {
        user: 5000,
        ip: 60,
        contentCreation: 10,
    },
    login: {
        github: {
            clientId: "",
            clientSecret: "",
        },
    },
    documentServer: {
        port: 9997,
        innerHostName: "0.0.0.0",
        outerHostName: "localhost",
    },
};

let pjson = require("../package.json");

export let version = pjson.version;

try {
    let secret = require("./secret");
    secret.load(config);
} catch (e) {
    console.log(e);
}
