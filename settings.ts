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

export let api = new Map<types.Environment, string>();
let api0 = "http://localhost:9998";
let api1 = "https://yorkyao.xyz";
api.set("development", api0);
api.set("test", api0);
api.set("production", api1);

export let urls = {
    login: "/login_with_authentication_credential"
};

export let imageUploader = "http://localhost:9999";

export let documentServer = new Map<types.Environment, string>();
let documentServer0 = "http://localhost:9997";
let documentServer1 = "https://doc.yorkyao.xyz";
documentServer.set("development", documentServer0);
documentServer.set("test", documentServer0);
documentServer.set("production", documentServer1);

export let imageServer = new Map<types.Environment, string>();
let imageServer0 = "http://localhost:7777";
let imageServer1 = "https://img.yorkyao.xyz";
imageServer.set("development", imageServer0);
imageServer.set("test", imageServer0);
imageServer.set("production", imageServer1);

export let frontendsServer = new Map<types.Environment, string>();
let frontendsServer0 = "https://yorkyao.xyz";
let frontendsServer1 = "http://localhost:8888";
frontendsServer.set("development", frontendsServer1);
frontendsServer.set("test", frontendsServer0);
frontendsServer.set("production", frontendsServer0);

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

export let apiPort = 9998;
export let imageUploaderPort = 9999;

try {
    let secret = require("./secret");
    secret.load();
} catch (e) {
    console.log(e);
}
