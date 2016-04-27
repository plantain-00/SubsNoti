"use strict";
const types = require("./share/types");
exports.currentEnvironment = process.env.NODE_ENV || types.environment.production;
exports.db = undefined;
exports.smtp = {
    host: process.env.SUBS_NOTI_SMTP_HOST,
    auth: {
        user: process.env.SUBS_NOTI_SMTP_USER,
        pass: process.env.SUBS_NOTI_SMTP_PASSWORD,
    },
};
exports.redis = {
    host: process.env.SUBS_NOTI_REDIS_HOST || "localhost",
    port: process.env.SUBS_NOTI_REDIS_PORT || 6379,
    options: {
        pass: process.env.SUBS_NOTI_REDIS_PASSWORD,
    },
};
exports.mongodb = {
    url: process.env.SUBS_NOTI_MONGODB_URL || "mongodb://127.0.0.1:27017/log_db_test",
    options: {
        user: process.env.SUBS_NOTI_MONGODB_USER,
        pass: process.env.SUBS_NOTI_MONGODB_PASSWORD,
    },
};
exports.api = process.env.SUBS_NOTI_API_URL || "http://localhost:9998";
exports.urls = {
    login: "/login_with_authentication_credential",
    version: "/api/version",
};
exports.imageUploader = process.env.SUBS_NOTI_IMAGE_UPLOADER_URL || "http://localhost:9999";
exports.documentServer = process.env.SUBS_NOTI_DOCUMENT_URL || "http://localhost:9997";
exports.imageServer = process.env.SUBS_NOTI_IMAGE_SERVER_URL || "http://localhost:7777";
exports.frontendsServer = process.env.SUBS_NOTI_FRONTEND_SERVER || "http://localhost:8888";
exports.maxOrganizationNumberUserCanCreate = 3;
exports.cookieKeys = {
    authenticationCredential: "authentication_credential",
};
exports.cacheKeys = {
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
exports.defaultItemLimit = 10;
exports.authorizationHeaders = {
    token: "token ",
};
exports.uploadIPWhiteList = (process.env.SUBS_NOTI_UPLOAD_IP_WHITE_LIST || "127.0.0.1").split(",");
exports.cookieDomains = process.env.SUBS_NOTI_COOKIE_DOMAIN || undefined;
exports.imagePaths = {
    avatar: "avatar-",
};
exports.cors = {
    methods: "GET,PUT,POST,DELETE",
    credentials: true,
    origin: (process.env.SUBS_NOTI_CORS_ORIGIN || "http://localhost:8888").split(","),
};
exports.rateLimit = {
    user: 5000,
    ip: 600,
    contentCreation: 10,
    sendEmail: 3600,
    userCaptcha: 1,
};
exports.login = {
    github: {
        clientId: process.env.SUBS_NOTI_GITHUB_CLIENT_ID,
        clientSecret: process.env.SUBS_NOTI_GITHUB_CLIENT_SECRET,
    },
};
const pjson = require("./package.json");
exports.version = pjson.version;
exports.headerNames = {
    version: "X-Version",
    rateLimit: {
        limit: "X-RateLimit-Limit",
        remain: "X-RateLimit-Remain",
        resetMoment: "X-RateLimit-ResetMoment",
    },
    authorization: "Authorization",
};
exports.scopes = [
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
exports.apiPort = 9998;
exports.imageUploaderPort = 9999;
