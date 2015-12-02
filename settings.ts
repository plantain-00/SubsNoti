"use strict";

import * as types from "./types";

export let currentEnvironment: types.Environment;

export let db = new Map<types.Environment, { host: string; user: string; password: string; database: string; }>();

export let smtp = new Map<types.Environment, { host: string; auth: { user: string; pass: string; }; }>();

export let redis = new Map<types.Environment, { host: string; port: number; options: { auth_pass: string; }; }>();

export let mongodb = new Map<types.Environment, { url: string; options: { user: string; pass: string; } }>();

export let api = new Map<types.Environment, { host: string; port: number; }>();

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

export function getImageUploader() {
    let localImageUploader = imageUploader.get(currentEnvironment);
    if (localImageUploader.port === 80) {
        return `http://${localImageUploader.host}`;
    }
    return `http://${localImageUploader.host}:${localImageUploader.port}`;
}

export let documentServer = new Map<types.Environment, string>();

export let imageServer = new Map<types.Environment, string>();

export let frontendsServer = new Map<types.Environment, string>();

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

export let imagePaths = {
    avatar: "avatar-"
};

export let cors = new Map<types.Environment, { methods: string; credentials: boolean, origin: string[]; }>();

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

try {
    let secret = require("./secret");
    secret.load();
} catch (e) {
    console.log(e);
}
