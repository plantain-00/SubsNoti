"use strict";

import * as types from "./types";

export let currentEnvironment: types.Environment = types.environment.development;

export let db = {
    host: "",
    user: "",
    password: "",
    database: "",
};

export let smtp = {
    host: "",
    auth: {
        user: "",
        pass: "",
    },
};

export let redis = {
    host: "",
    port: 6379,
    options: {
        auth_pass: ""
    },
};

export let mongodb = {
    url: "",
    options: {
        user: "",
        pass: "",
    },
};

export let api = {
    host: "localhost",
    port: 9998,
};

export function getApi() {
    if (api.port === 80) {
        return `http://${api.host}`;
    }
    return `http://${api.host}:${api.port}`;
}

export let urls = {
    login: "/login_with_authentication_credential"
};

export let imageUploader = {
    host: "localhost",
    port: 9999,
};

export function getImageUploader() {
    if (imageUploader.port === 80) {
        return `http://${imageUploader.host}`;
    }
    return `http://${imageUploader.host}:${imageUploader.port}`;
}

export let documentServer = "http://localhost:9997";

export let imageServer = "http://localhost:7777";

export let frontEndsServer = "http://localhost:8888";

export let maxOrganizationNumberUserCanCreate = 3;

export let cookieKeys = {
    authenticationCredential: "authentication_credential"
};

export let cacheKeys = {
    user: "user_",
    userCaptcha: "user_captcha_",
    rateLimit: {
        userId: "rateLimit_userId_",
        ip: "rateLimit_ip_",
        contentCreation: "rateLimit_contentCreation_",
        sendEmail: "rateLimit_sendEmail_",
        userCaptcha: "rateLimit_userCaptcha_",
    },
    githubLoginCode: "github_login_",
};

export let defaultItemLimit = 10;

export let uploadIPWhiteList = [
    "127.0.0.1"
];

export let imagePaths = {
    avatar: "avatar-"
};

export let cors = {
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
    origin: [
        "http://localhost:8888"
    ],
};

export let rateLimit = {
    user: 5000,
    ip: 600,
    contentCreation: 10,
    sendEmail: 3600,
    userCaptcha: 1,
};

export let login = {
    github: {
        clientId: "",
        clientSecret: "",
    },
};

let pjson = require("./package.json");

export let version = pjson.version;
