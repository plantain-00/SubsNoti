"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";

settings.currentEnvironment = types.environment.test;

import * as services from "../services";

let apiUrl = settings.api.get(settings.currentEnvironment);
let imageServer = settings.imageServer.get(settings.currentEnvironment);
let imageUploader = settings.imageUploader;

let jar = libs.request.jar();

let headers;

export let operate: (caseName: string, body: any) => Promise<void>;

let seeds: types.TestSeed = require("./seeds.json");

async function getVersion(caseName: string) {
    let options = {
        url: apiUrl + "/api/version"
    };
    let response = await services.request.request(options);

    let body: types.VersionResponse = response.body;
    if (!body.isSuccess || body.version !== settings.version) {
        throw body;
    }

    await operate(caseName, libs._.omit<any, any>(body, ["version"]));

    return Promise.resolve(body.version);
}

async function createCaptcha(guid: string, caseName: string) {
    let options = {
        url: apiUrl + "/api/captchas",
        headers: headers,
        method: types.httpMethod.post,
        form: {
            id: guid
        },
    };
    let response = await services.request.request(options);

    let body: types.CaptchaResponse = response.body;
    if (!body.isSuccess || !body.code) {
        throw body;
    }

    await operate(caseName, libs._.omit<any, any>(body, ["url", "code"]));

    return Promise.resolve(body.code);
}

async function createToken(guid: string, code: string, caseName: string, email: string, name: string) {
    let options = {
        url: apiUrl + "/api/tokens",
        headers: headers,
        method: types.httpMethod.post,
        form: {
            email: email,
            name: name,
            guid: guid,
            code: code,
        },
    };
    let response = await services.request.request(options);

    let body: types.TokenResponse = response.body;
    if (!body.isSuccess || !body.url) {
        throw body;
    }

    await operate(caseName, libs._.omit<any, any>(body, ["url"]));

    return Promise.resolve(body.url);
}

async function login(url: string, caseName: string) {
    let options = {
        url: url,
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options, types.responseType.others);

    let cookies = libs.cookie.parse(jar.getCookieString(apiUrl));
    let authenticationCredential = cookies[settings.cookieKeys.authenticationCredential];
    if (!authenticationCredential) {
        throw cookies;
    }

    await operate(caseName, {
        statusCode: response.response.statusCode
    });

    return Promise.resolve();
}

async function logout(caseName: string) {
    let options = {
        url: apiUrl + "/api/user/logged_in",
        headers: headers,
        method: types.httpMethod.delete,
        jar: jar,
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;

    let cookies = libs.cookie.parse(jar.getCookieString(apiUrl));
    let authenticationCredential = cookies[settings.cookieKeys.authenticationCredential];
    if (!body.isSuccess) {
        throw body;
    }
    if (authenticationCredential) {
        throw cookies;
    }

    await operate(caseName, response.body);
}

async function getCurrentUser(caseName: string) {
    let options = {
        url: apiUrl + "/api/user",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let body: types.CurrentUserResponse = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, libs._.omit<any, any>(body, ["id", "avatar"]));

    return Promise.resolve(body);
}

async function createOrganization(caseName: string) {
    let options = {
        url: apiUrl + "/api/organizations",
        method: types.httpMethod.post,
        headers: headers,
        jar: jar,
        form: {
            organizationName: seeds.organizationName
        },
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, body);

    return Promise.resolve();
}

async function getCreatedOrganizations(caseName: string) {
    let options = {
        url: apiUrl + "/api/user/created",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let body: types.OrganizationResponse = response.body;
    if (!body.isSuccess || !body.organizations) {
        throw body;
    }

    let result = libs._.omit<any, any>(body, "organizations");
    result["organizations"] = libs._.map(body.organizations, organization => libs._.omit<any, any>(organization, "id"));
    await operate(caseName, result);

    return Promise.resolve(body.organizations);
}

async function getJoinedOrganizations(caseName: string) {
    let options = {
        url: apiUrl + "/api/user/joined",
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let body: types.OrganizationResponse = response.body;
    if (!body.isSuccess || !body.organizations) {
        throw body;
    }

    let result = libs._.omit<any, any>(body, "organizations");
    result["organizations"] = libs._.map(body.organizations, organization => libs._.omit<any, any>(organization, "id"));
    await operate(caseName, result);

    return Promise.resolve(body.organizations);
}

async function getThemesOfOrganization(organizationId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/organizations/${organizationId}/themes`,
        headers: headers,
        jar: jar,
        qs: {
            isClosed: types.yes
        },
    };
    let response = await services.request.request(options);

    let body: types.ThemeResponse = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    let result = libs._.omit<any, any>(body, "themes");
    result.themes = libs._.map(body.themes, (theme: types.Theme) => {
        let t = libs._.pick<any, any>(theme, "title", "detail", "status");
        t.creator = libs._.pick<any, any>(theme.creator, "name", "email");
        t.owners = libs._.map(theme.owners, owner => libs._.pick<any, any>(owner, "name", "email"));
        t.watchers = libs._.map(theme.watchers, watcher => libs._.pick<any, any>(watcher, "name", "email"));
        return t;
    });

    await operate(caseName, result);

    return Promise.resolve(body);
}

async function createTheme(organizationId: string, caseName: string) {
    let options = {
        url: apiUrl + "/api/themes",
        method: types.httpMethod.post,
        headers: headers,
        jar: jar,
        form: {
            themeTitle: seeds.themeTitle,
            themeDetail: seeds.themeDetail,
            organizationId: organizationId,
        },
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, body);

    return Promise.resolve();
}

async function unwatch(themeId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/user/watched/${themeId}`,
        method: types.httpMethod.delete,
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, body);

    return Promise.resolve();
}

async function watch(themeId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/user/watched/${themeId}`,
        method: types.httpMethod.put,
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, body);

    return Promise.resolve();
}

async function updateTheme(themeId: string, caseName: string) {
    let options = {
        url: apiUrl + `/api/themes/${themeId}`,
        method: types.httpMethod.put,
        headers: headers,
        jar: jar,
        form: {
            title: seeds.newThemeTitle,
            detail: seeds.newThemeDetail,
            status: types.themeStatus.closed,
        },
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, body);

    return Promise.resolve();
}

async function uploadAvatar(caseName: string) {
    let fileName = "newAvatar.png";
    let formData = {};
    formData[fileName] = {
        value: libs.fs.createReadStream(libs.path.resolve(__dirname, fileName)),
        options: {
            filename: fileName,
            contentType: "image/png",
        },
    };

    let options = {
        url: imageUploader + `/api/temperary`,
        method: types.httpMethod.post,
        headers: headers,
        jar: jar,
        formData: formData,
    };
    let response = await services.request.request(options);

    let body: types.TemperaryResponse = response.body;
    if (!body.isSuccess || body.names.length !== 1) {
        throw body;
    }

    await operate(caseName, libs._.omit<any, any>(body, ["names"]));

    return Promise.resolve(body.names);
}

async function getTemperaryImage(fileName: string, caseName: string) {
    let options = {
        url: imageServer + `/tmp/${fileName}`
    };
    let response = await services.request.request(options, types.responseType.others);

    await operate(caseName, {
        statusCode: response.response.statusCode
    });

    return Promise.resolve();
}

async function updateUser(caseName: string) {
    let names = await uploadAvatar("uploadAvatar");
    let name = names[0];

    await getTemperaryImage(name, "getTemperaryImage");

    let options = {
        url: apiUrl + `/api/user`,
        method: types.httpMethod.put,
        headers: headers,
        jar: jar,
        form: {
            name: seeds.newName,
            avatarFileName: name,
        },
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, body);

    return Promise.resolve();
}

async function invite(caseName: string, email: string, organizationId: string) {
    let options = {
        url: apiUrl + `/api/users/${email}/joined/${organizationId}`,
        method: types.httpMethod.put,
        headers: headers,
        jar: jar,
    };
    let response = await services.request.request(options);

    let body: types.Response = response.body;
    if (!body.isSuccess) {
        throw body;
    }

    await operate(caseName, body);

    return Promise.resolve();
}

async function getAvatar(uid: string, caseName: string) {
    let options = {
        url: imageServer + `/avatar-${uid}.png`
    };
    let response = await services.request.request(options, types.responseType.others);

    await operate(caseName, {
        statusCode: response.response.statusCode
    });

    return Promise.resolve();
}

export async function run() {
    let version = await getVersion("getVersion");

    headers = {};
    headers[settings.headerNames.version] = version;

    services.mongo.connect();
    await services.mongo.User.remove({}).exec();
    await services.mongo.Organization.remove({}).exec();
    await services.mongo.Theme.remove({}).exec();
    libs.mongoose.disconnect();


    let clientGuid = libs.generateUuid();

    let clientCode = await createCaptcha(clientGuid, "createCaptcha-client");

    let clientUrl = await createToken(clientGuid, clientCode, "createToken-client", seeds.clientEmail, seeds.clientName);

    await login(clientUrl, "login-client");

    let client = await getCurrentUser("getCurrentUser-client");

    await getAvatar(client.id, "getAvatar-client");

    let clientOrganizations = await getJoinedOrganizations("getJoinedOrganizations-client");

    await logout("logout-client");


    let guid = libs.generateUuid();

    let code = await createCaptcha(guid, "createCaptcha");

    let url = await createToken(guid, code, "createToken", seeds.email, seeds.name);

    await login(url, "login");

    let user = await getCurrentUser("getCurrentUser");

    await getAvatar(user.id, "getAvatar");

    await createOrganization("createOrganization");

    await getCreatedOrganizations("getCreatedOrganizations");

    let organizations = await getJoinedOrganizations("getJoinedOrganizations");

    let organizationId = organizations[0].id;
    if (!organizationId) {
        throw organizations;
    }

    await createTheme(organizationId, "createTheme");

    let themes = await getThemesOfOrganization(organizationId, "getThemesOfOrganization");

    let themeId = themes.themes[0].id;
    if (!themeId) {
        throw themes.themes;
    }

    await unwatch(themeId, "unwatch");

    await getThemesOfOrganization(organizationId, "getThemesOfOrganization-afterUnwatched");

    await watch(themeId, "watch");

    await getThemesOfOrganization(organizationId, "getThemesOfOrganization-afterWatched");

    await updateTheme(themeId, "updateTheme");

    await getThemesOfOrganization(organizationId, "getThemesOfOrganization-afterUpdated");

    await updateUser("updateUser");

    user = await getCurrentUser("getCurrentUser-afterUpdated");

    await invite("invite", client.email, organizationId);

    await logout("logout");


    await login(clientUrl, "login-client-afterInvited");

    client = await getCurrentUser("getCurrentUser-client-afterInvited");

    clientOrganizations = await getJoinedOrganizations("getJoinedOrganizations-client-afterInvited");

    await logout("logout-client-afterInvited");
}
