import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export let currentEnvironment: types.Environment = process.env.NODE_ENV || types.environment.production;

export const api: string = process.env.SUBS_NOTI_API_URL || "http://localhost:9998";

export const urls = {
    login: "/login_with_authentication_credential",
    version: "/api/version",
};

export const imageUploader: string = process.env.SUBS_NOTI_IMAGE_UPLOADER_URL || "http://localhost:9999";

export const imageServer: string = process.env.SUBS_NOTI_IMAGE_SERVER_URL || "http://localhost:7777";

export const cookieKeys = {
    authenticationCredential: "authentication_credential",
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

export const authorizationHeaders = {
    token: "token ",
};

export const cookieDomains: string = process.env.SUBS_NOTI_COOKIE_DOMAIN || undefined;

export const imagePaths = {
    avatar: "avatar-",
};

export const rateLimit = {
    user: 5000,
    ip: 600,
    contentCreation: 10,
    sendEmail: 3600,
    userCaptcha: 1,
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
