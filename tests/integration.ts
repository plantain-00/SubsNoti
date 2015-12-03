"use strict";

import * as assert from "assert";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";

settings.currentEnvironment = types.environment.test;

import * as services from "../services";

let apiUrl = settings.getApi();

let jar = libs.request.jar();

let headers;

export let operate: (caseName: string, body: string) => Promise<void>;

let seeds = require("./seeds.json");

async function getVersion(caseName: string) {
    let options = {
        url: apiUrl + "/api/version"
    };
    let response = await services.request.request(options);

    let version: string = response.body["version"];
    assert(version, JSON.stringify(response.body));

    await operate(caseName, response.body);

    return Promise.resolve(version);
}

async function createCaptcha(guid: string, caseName: string) {
    let options = {
        url: apiUrl + "/api/captchas",
        headers: headers,
        method: "post",
        form: {
            id: guid
        },
    };
    let response = await services.request.request(options);

    let code: string = response.body["code"];
    assert(code, JSON.stringify(response.body));

    await operate(caseName, libs._.omit<any, any>(response.body, ["url", "code"]));

    return Promise.resolve(code);
}

async function createToken(guid: string, code: string, caseName: string) {
    let options = {
        url: apiUrl + "/api/tokens",
        headers: headers,
        method: "post",
        form: {
            email: seeds.email,
            name: seeds.name,
            guid: guid,
            code: code,
        },
    };
    let response = await services.request.request(options);

    let url: string = response.body["url"];
    assert(url, JSON.stringify(response.body));

    await operate(caseName, libs._.omit<any, any>(response.body, ["url"]));

    return Promise.resolve(url);
}

async function login(url: string, caseName: string) {
    let options = {
        url: url,
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options, "html");

    let authenticationCredential = libs.cookie.parse(jar.getCookieString(apiUrl))[settings.cookieKeys.authenticationCredential];
    assert(authenticationCredential);

    await operate(caseName, response.body);

    return Promise.resolve(authenticationCredential);
}

async function logout(caseName: string) {
    let options = {
        url: apiUrl + "/api/user/logged_in",
        headers: headers,
        method: "delete",
        jar: jar,
    };
    let response = await services.request.request(options);

    let authenticationCredential = libs.cookie.parse(jar.getCookieString(apiUrl))[settings.cookieKeys.authenticationCredential];
    assert(!authenticationCredential);

    await operate(caseName, response.body);
}

async function getCurrentUser(caseName: string) {
    let options = {
        url: apiUrl + "/api/user",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    await operate(caseName, libs._.omit<any, any>(response.body, ["id", "avatar"]));

    return Promise.resolve(response.body);
}

async function createAnOrganization(caseName: string) {
    let options = {
        url: apiUrl + "/api/organizations",
        method: "post",
        headers: headers,
        jar: jar,
        form: {
            organizationName: seeds.organizationName
        },
    };
    let response = await services.request.request(options);

    await operate(caseName, response.body);

    return Promise.resolve();
}

interface Organization {
    id: string;
    name: string;
}

async function getCreatedOrganizations(caseName: string) {
    let options = {
        url: apiUrl + "/api/user/created",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let organizations: Organization[] = response.body["organizations"];
    assert(organizations);

    let result = libs._.omit<any, any>(response.body, "organizations");
    result["organizations"] = libs._.map(organizations, organization => libs._.omit<any, any>(organization, "id"));
    await operate(caseName, result);

    return Promise.resolve(organizations);
}

async function getJoinedOrganizations(caseName: string) {
    let options = {
        url: apiUrl + "/api/user/joined",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let organizations: Organization[] = response.body["organizations"];
    assert(organizations);

    let result = libs._.omit<any, any>(response.body, "organizations");
    result["organizations"] = libs._.map(organizations, organization => libs._.omit<any, any>(organization, "id"));
    await operate(caseName, result);

    return Promise.resolve(organizations);
}

async function getThemesOfOrganization(organizationId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/organizations/${organizationId}/themes`,
        headers: headers,
        jar: jar,
        qs: {
            isClosed: "true"
        },
    };
    let response = await services.request.request(options);

    let result = libs._.omit<any, any>(response.body, "themes");
    result.themes = libs._.map(response.body.themes, (theme: any) => {
        let t = libs._.pick<any, any>(theme, "title", "detail", "status");
        t.creator = libs._.pick<any, any>(theme.creator, "name", "email");
        t.owners = libs._.map(theme.owners, owner => libs._.pick<any, any>(owner, "name", "email"));
        t.watchers = libs._.map(theme.watchers, watcher => libs._.pick<any, any>(watcher, "name", "email"));
        return t;
    });

    await operate(caseName, result);

    return Promise.resolve(response.body);
}

async function createATheme(organizationId: string, caseName: string) {
    let options = {
        url: apiUrl + "/api/themes",
        method: "post",
        headers: headers,
        jar: jar,
        form: {
            themeTitle: seeds.themeTitle,
            themeDetail: seeds.themeDetail,
            organizationId: organizationId,
        },
    };
    let response = await services.request.request(options);

    await operate(caseName, response.body);

    return Promise.resolve();
}

async function unwatch(themeId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/user/watched/${themeId}`,
        method: "delete",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    await operate(caseName, response.body);

    return Promise.resolve();
}

async function watch(themeId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/user/watched/${themeId}`,
        method: "put",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    await operate(caseName, response.body);

    return Promise.resolve();
}

async function updateTheme(themeId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/themes/${themeId}`,
        method: "put",
        headers: headers,
        jar: jar,
        form: {
            title: seeds.newThemeTitle,
            detail: seeds.newThemeDetail,
            status: "closed",
        },
    };
    let response = await services.request.request(options);

    await operate(caseName, response.body);

    return Promise.resolve();
}

export async function run() {
    let version = await getVersion("getVersion");

    headers = {
        "X-Version": version
    };

    services.mongo.connect();
    await services.mongo.User.remove({}).exec();
    await services.mongo.Organization.remove({}).exec();
    await services.mongo.Theme.remove({}).exec();
    libs.mongoose.disconnect();

    let guid = libs.generateUuid();

    let code = await createCaptcha(guid, "createCaptcha");

    let url = await createToken(guid, code, "createToken");

    let authenticationCredential = await login(url, "login");

    let user = await getCurrentUser("getCurrentUser");

    await createAnOrganization("createAnOrganization");

    await getCreatedOrganizations("getCreatedOrganizations");

    let organizations = await getJoinedOrganizations("getJoinedOrganizations");

    let organizationId = organizations[0].id;
    assert(organizationId);

    await createATheme(organizationId, "createATheme");

    let themes = await getThemesOfOrganization(organizationId, "getThemesOfOrganization");

    let themeId = themes.themes[0].id;
    assert(themeId);

    await unwatch(themeId, "unwatch");

    await getThemesOfOrganization(organizationId, "getThemesOfOrganizationAfterUnwatched");

    await watch(themeId, "watch");

    await getThemesOfOrganization(organizationId, "getThemesOfOrganizationAfterWatched");

    await updateTheme(themeId, "updateTheme");

    await getThemesOfOrganization(organizationId, "getThemesOfOrganizationAfterUpdated");

    await logout("logout");
}
