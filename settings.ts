"use strict";

import * as types from "./types";

export let currentEnvironment: types.Environment;

export let db = new Map<types.Environment, { host: string; user: string; password: string; database: string; }>();

export let smtp = new Map<types.Environment, { host: string; auth: { user: string; pass: string; }; }>();

export let redis = new Map<types.Environment, { host: string; port: number; options?: { auth_pass: string; }; }>();

redis.set("test", {
    host: "localhost",
    port: 6379,
});

export let mongodb = new Map<types.Environment, { url: string; options?: { user: string; pass: string; } }>();

mongodb.set("test", {
    url: "mongodb://127.0.0.1:27017/log_db_test"
});

export let api = new Map<types.Environment, { host: string; port: number; }>();

api.set("test", {
    host: "localhost",
    port: 9998,
});

export function getApi() {
    let localApi = api.get(currentEnvironment);
    if (localApi.port === 80) {
        return `http://${localApi.host}`;
    }
    return `http://${localApi.host}:${localApi.port}`;
}

export let urls = {
    login: "/login_with_authentication_credential"
};

export let imageUploader = new Map<types.Environment, { host: string; port: number; }>();

imageUploader.set("test", {
    host: "localhost",
    port: 9999,
});

export function getImageUploader() {
    let localImageUploader = imageUploader.get(currentEnvironment);
    if (localImageUploader.port === 80) {
        return `http://${localImageUploader.host}`;
    }
    return `http://${localImageUploader.host}:${localImageUploader.port}`;
}

export let documentServer = new Map<types.Environment, string>();

documentServer.set("test", "http://localhost:9997");

export let imageServer = new Map<types.Environment, string>();

imageServer.set("test", "http://localhost:7777");

export let frontendsServer = new Map<types.Environment, string>();

frontendsServer.set("test", "http://115.29.42.125");

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

export let uploadIPWhiteList = new Map<types.Environment, string[]>();

uploadIPWhiteList.set("test", ["127.0.0.1"]);

export let imagePaths = {
    avatar: "avatar-"
};

export let cors = new Map<types.Environment, { methods: string; credentials: boolean, origin: string[]; }>();

cors.set("test", {
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
    origin: [
        "http://localhost:8888"
    ],
});

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

export let headerNames = {
    version: "X-Version",
    rateLimit: {
        limit: "X-RateLimit-Limit",
        remain: "X-RateLimit-Remain",
        resetMoment: "X-RateLimit-ResetMoment",
    },
};

export let scopes: types.Scope[] = [
    { name: "read:user", description: "get current user" },
    { name: "write:user", description: "update current user" },
    { name: "read:organization", description: "get joined or created organizations" },
    { name: "write:organization", description: "create an organization; invite an user" },
    { name: "read:theme", description: "get themes of an organization" },
    { name: "write:theme", description: "create, update, watch, unwatch a theme" },
    { name: "read:application", description: "get registered or authorized applications" },
    { name: "write:application", description: "register, update, revoke an application, reset client secret" },
    { name: "delete:application", description: "delete an application" },
    { name: "read:access_token", description: "get access tokens" },
    { name: "write:access_token", description: "create, update an access token" },
    { name: "delete:access_token", description: "delete an access token" },
];

try {
    let secret = require("./secret");
    secret.load();
} catch (e) {
    console.log(e);
}
