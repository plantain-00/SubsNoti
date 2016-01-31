import * as types from "./share/types";

export let currentEnvironment: types.Environment;

export function setEnvironment(environment: types.Environment) {
    currentEnvironment = environment;
}

export const db = new Map<types.Environment, { host: string; user: string; password: string; database: string; }>();

export const smtp = new Map<types.Environment, { host: string; auth: { user: string; pass: string; }; }>();

export const redis = new Map<types.Environment, { host: string; port: number; options?: { auth_pass: string; }; }>();

redis.set("test", {
    host: "localhost",
    port: 6379,
});

export const mongodb = new Map<types.Environment, { url: string; options?: { user: string; pass: string; } }>();

mongodb.set("test", {
    url: "mongodb://127.0.0.1:27017/log_db_test"
});

export const api = new Map<types.Environment, string>();
const api0 = "http://localhost:9998";
const api1 = "https://yorkyao.xyz";
api.set("development", api0);
api.set("test", api0);
api.set("production", api1);

export const urls = {
    login: "/login_with_authentication_credential",
    version: "/api/version",
};

export const imageUploader = new Map<types.Environment, string>();
const imageUploader0 = "http://localhost:9999";
const imageUploader1 = "https://upload.yorkyao.xyz";
imageUploader.set("development", imageUploader0);
imageUploader.set("test", imageUploader0);
imageUploader.set("production", imageUploader1);

export const documentServer = new Map<types.Environment, string>();
const documentServer0 = "http://localhost:9997";
const documentServer1 = "https://doc.yorkyao.xyz";
documentServer.set("development", documentServer0);
documentServer.set("test", documentServer0);
documentServer.set("production", documentServer1);

export const imageServer = new Map<types.Environment, string>();
const imageServer0 = "http://localhost:7777";
const imageServer1 = "https://img.yorkyao.xyz";
imageServer.set("development", imageServer0);
imageServer.set("test", imageServer0);
imageServer.set("production", imageServer1);

export const frontendsServer = new Map<types.Environment, string>();
const frontendsServer0 = "https://yorkyao.xyz";
const frontendsServer1 = "http://localhost:8888";
frontendsServer.set("development", frontendsServer1);
frontendsServer.set("test", frontendsServer0);
frontendsServer.set("production", frontendsServer0);

export const maxOrganizationNumberUserCanCreate = 3;

export const cookieKeys = {
    authenticationCredential: "authentication_credential"
};

export const cacheKeys = {
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
    oauthLoginCode: "oauth_login_",
};

export const defaultItemLimit = 10;

export const authorizationHeaders = {
    token: "token "
};

export const uploadIPWhiteList = new Map<types.Environment, string[]>();

const uploadIPWhiteList1 = ["127.0.0.1"];
const uploadIPWhiteList2 = ["115.29.42.125", "127.0.0.1"];
uploadIPWhiteList.set("development", uploadIPWhiteList1);
uploadIPWhiteList.set("test", uploadIPWhiteList1);
uploadIPWhiteList.set("production", uploadIPWhiteList2);

export const cookieDomains = new Map<types.Environment, string>();

const cookieDomain1 = undefined;
const cookieDomain2 = ".yorkyao.xyz";
cookieDomains.set("development", cookieDomain1);
cookieDomains.set("test", cookieDomain1);
cookieDomains.set("production", cookieDomain2);

export const imagePaths = {
    avatar: "avatar-"
};

export const cors = new Map<types.Environment, { methods: string; credentials: boolean, origin: string[]; }>();

const cors1 = {
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
    origin: [
        "http://localhost:8888"
    ],
};
const cors2 = {
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
    origin: [
        "https://yorkyao.xyz"
    ],
};
cors.set("development", cors1);
cors.set("test", cors1);
cors.set("production", cors2);

cors.set("test", {
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
    origin: [
        "http://localhost:8888"
    ],
});

export const rateLimit = {
    user: 5000,
    ip: 600,
    contentCreation: 10,
    sendEmail: 3600,
    userCaptcha: 1,
};

export const login = {
    github: {
        clientId: "",
        clientSecret: "",
    },
};

const pjson = require("./package.json");

export const version = pjson.version;

export const headerNames = {
    version: "X-Version",
    rateLimit: {
        limit: "X-RateLimit-Limit",
        remain: "X-RateLimit-Remain",
        resetMoment: "X-RateLimit-ResetMoment",
    },
    authorization: "Authorization",
};

export const scopes: types.Scope[] = [
    { name: types.scopeNames.readUser, description: "get current user" },
    { name: types.scopeNames.writeUser, description: "update current user" },
    { name: types.scopeNames.readOrganization, description: "get joined or created organizations" },
    { name: types.scopeNames.writeOrganization, description: "create an organization; invite an user" },
    { name: types.scopeNames.readTheme, description: "get themes of an organization" },
    { name: types.scopeNames.writeTheme, description: "create, update, watch, unwatch a theme" },
    { name: types.scopeNames.readApplication, description: "get registered or authorized applications" },
    { name: types.scopeNames.writeApplication, description: "register, update, revoke an application, reset client secret" },
    { name: types.scopeNames.deleteApplication, description: "delete an application" },
    { name: types.scopeNames.readAccessToken, description: "get access tokens" },
    { name: types.scopeNames.writeAccessToken, description: "create, update an access token" },
    { name: types.scopeNames.deleteAccessToken, description: "delete an access token" },
];

export const apiPort = 9998;
export const imageUploaderPort = 9999;

try {
    const secret = require("./secret");
    secret.load();
} catch (e) {
    console.log(e);
}
