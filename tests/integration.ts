import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

const apiUrl = services.settings.api;
const imageServer = services.settings.imageServer;
const imageUploader = services.settings.imageUploader;

const jar = libs.request.jar();

const headers: any = {};
const headersWithAuthorization: any = {};

let operate: (caseName: string, body: any) => Promise<void>;

export function setOperation(operation: (caseName: string, body: any) => Promise<void>) {
    operate = operation;
}

const seeds: types.TestSeed = require("./seeds.json");

async function getVersion(caseName: string) {
    const options = {
        url: apiUrl + "/api/version",
    };
    const [, body] = await services.request.request<types.VersionResponse>(options);
    services.utils.assert(body.status === 0 && body.version === services.settings.version, body);

    await operate(caseName, libs.omit(body, ["version"]));

    return body.version;
}

async function createCaptcha(guid: string, caseName: string) {
    const options = {
        url: apiUrl + "/api/captchas",
        headers,
        method: types.httpMethod.post,
        form: {
            id: guid,
        },
    };
    const [, body] = await services.request.request<types.CaptchaResponse>(options);
    services.utils.assert(body.status === 0 && body.code, body);

    await operate(caseName, libs.omit(body, ["url", "code"]));

    return body.code;
}

async function createToken(guid: string, code: string | undefined, caseName: string, email: string, name: string) {
    const options = {
        url: apiUrl + "/api/tokens",
        headers,
        method: types.httpMethod.post,
        form: { email, name, guid, code },
    };
    const [, body] = await services.request.request<types.TokenResponse>(options);
    services.utils.assert(body.status === 0 && body.url, body);

    await operate(caseName, libs.omit(body, ["url"]));

    return body.url;
}

async function login(url: string, caseName: string) {
    const options = { url, headers, jar };
    const [response] = await services.request.request(options, types.responseType.others);

    const cookies = libs.cookie.parse(jar.getCookieString(apiUrl));
    const authenticationCredential = cookies[services.settings.cookieKeys.authenticationCredential];
    services.utils.assert(authenticationCredential, cookies);

    return operate(caseName, {
        statusCode: response.statusCode,
    });
}

async function logout(caseName: string) {
    const options = {
        url: apiUrl + "/api/user/logged_in",
        headers,
        method: types.httpMethod.delete,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);

    const cookies = libs.cookie.parse(jar.getCookieString(apiUrl));
    const authenticationCredential = cookies[services.settings.cookieKeys.authenticationCredential];
    services.utils.assert(body.status === 0, body);
    services.utils.assert(!authenticationCredential, cookies);

    return operate(caseName, body);
}

async function getCurrentUser(caseName: string, accessToken?: string) {
    let options: any;
    if (accessToken) {
        headersWithAuthorization[services.settings.headerNames.authorization] = services.settings.authorizationHeaders.token + accessToken;

        options = {
            url: apiUrl + "/api/user",
            headers: headersWithAuthorization,
        };
    } else {
        options = {
            url: apiUrl + "/api/user",
            headers,
            jar,
        };
    }
    const [, body] = await services.request.request<types.CurrentUserResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result: any = libs.omit(body, "user");
    result["user"] = libs.omit(body.user, ["id", "avatar"]);
    await operate(caseName, result);

    return body;
}

async function createOrganization(caseName: string) {
    const options = {
        url: apiUrl + "/api/organizations",
        method: types.httpMethod.post,
        headers,
        jar,
        form: {
            organizationName: seeds.organization.name,
        },
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function getCreatedOrganizations(caseName: string) {
    const options = {
        url: apiUrl + "/api/user/created",
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.OrganizationsResponse>(options);
    services.utils.assert(body.status === 0 && body.organizations, body);

    const result: any = libs.omit(body, "organizations");
    result["organizations"] = body.organizations.map(organization => libs.omit(organization, "id"));
    await operate(caseName, result);

    return body.organizations;
}

async function getJoinedOrganizations(caseName: string) {
    const options = {
        url: apiUrl + "/api/user/joined",
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.OrganizationsResponse>(options);
    services.utils.assert(body.status === 0 && body.organizations, body);

    const result: any = libs.omit(body, "organizations");
    result["organizations"] = body.organizations.map(organization => libs.omit(organization, "id"));
    await operate(caseName, result);

    return body.organizations;
}

async function getThemesOfOrganization(organizationId: string, caseName: string) {
    const options = {
        url: apiUrl + `/api/organizations/${organizationId}/themes`,
        headers,
        jar,
        qs: {
            isClosed: types.yes,
        },
    };
    const [, body] = await services.request.request<types.ThemesResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result: any = libs.omit(body, "themes");
    result.themes = body.themes.map(theme => {
        const t: any = libs.pick(theme, "title", "detail", "status");
        t.creator = libs.pick(theme.creator, "name", "email");
        t.owners = theme.owners.map(owner => libs.pick(owner, "name", "email"));
        t.watchers = theme.watchers.map(watcher => libs.pick(watcher, "name", "email"));
        return t;
    });

    await operate(caseName, result);

    return body.themes;
}

async function createTheme(organizationId: string, caseName: string) {
    const options = {
        url: apiUrl + "/api/themes",
        method: types.httpMethod.post,
        headers,
        jar,
        form: {
            themeTitle: seeds.theme.title,
            themeDetail: seeds.theme.detail,
            organizationId,
        },
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function unwatch(themeId: string, caseName: string) {
    const options = {
        url: apiUrl + `/api/user/watched/${themeId}`,
        method: types.httpMethod.delete,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function watch(themeId: string, caseName: string) {
    const options = {
        url: apiUrl + `/api/user/watched/${themeId}`,
        method: types.httpMethod.put,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function updateTheme(themeId: string, caseName: string) {
    const options = {
        url: apiUrl + `/api/themes/${themeId}`,
        method: types.httpMethod.put,
        headers,
        jar,
        form: {
            title: seeds.newTheme.title,
            detail: seeds.newTheme.detail,
            status: types.themeStatus.closed,
        },
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function uploadAvatar(caseName: string) {
    const filename = "newAvatar.png";
    const formData: any = {};
    formData[filename] = {
        value: libs.fs.createReadStream(libs.path.resolve(__dirname, filename)),
        options: {
            filename,
            contentType: "image/png",
        },
    };

    const options = {
        url: imageUploader + `/api/temperary`,
        method: types.httpMethod.post,
        headers,
        jar,
        formData,
    };
    const [, body] = await services.request.request<types.TemperaryResponse>(options);
    services.utils.assert(body.status === 0 && body.names.length === 1, body);

    await operate(caseName, libs.omit(body, ["names"]));

    return body.names;
}

async function getTemperaryImage(fileName: string, caseName: string) {
    const options = {
        url: imageServer + `/tmp/${fileName}`,
    };
    const [response] = await services.request.request(options, types.responseType.others);

    return operate(caseName, {
        statusCode: response.statusCode,
    });
}

async function updateUser(caseName: string) {
    const names = await uploadAvatar("uploadAvatar");
    const name = names[0];

    await getTemperaryImage(name, "getTemperaryImage");

    const options = {
        url: apiUrl + `/api/user`,
        method: types.httpMethod.put,
        headers,
        jar,
        form: {
            name: seeds.newUser.name,
            avatarFileName: name,
        },
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function invite(caseName: string, email: string, organizationId: string) {
    const options = {
        url: apiUrl + `/api/users/${email}/joined/${organizationId}`,
        method: types.httpMethod.put,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function getAvatar(uid: string, caseName: string) {
    const options = {
        url: imageServer + `/avatar-${uid}.png`,
    };
    const [response] = await services.request.request(options, types.responseType.others);

    return operate(caseName, {
        statusCode: response.statusCode,
    });
}

async function getScopes(caseName: string) {
    const options = {
        url: apiUrl + `/api/scopes`,
        headers,
    };
    const [, body] = await services.request.request<types.ScopesResponse>(options);
    services.utils.assert(body.status === 0, body);

    await operate(caseName, body);

    return body.scopes;
}

async function getRegisteredApplications(caseName: string) {
    const options = {
        url: apiUrl + `/api/user/registered`,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.ApplicationsResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result: any = libs.omit(body, "applications");
    result.applications = body.applications.map(application => {
        return {
            name: application.name,
            homeUrl: application.homeUrl,
            description: application.description,
            authorizationCallbackUrl: application.authorizationCallbackUrl,
        };
    });

    await operate(caseName, result);

    return body.applications;
}

async function registerApplication(caseName: string) {
    const options = {
        url: apiUrl + `/api/user/registered`,
        method: types.httpMethod.post,
        headers,
        jar,
        form: {
            name: seeds.application.name,
            homeUrl: seeds.application.homeUrl,
            description: seeds.application.description,
            authorizationCallbackUrl: seeds.application.authorizationCallbackUrl,
        },
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function updateApplication(caseName: string, applicationId: string) {
    const options = {
        url: apiUrl + `/api/user/registered/${applicationId}`,
        method: types.httpMethod.put,
        headers,
        jar,
        form: {
            name: seeds.newApplication.name,
            homeUrl: seeds.newApplication.homeUrl,
            description: seeds.newApplication.description,
            authorizationCallbackUrl: seeds.newApplication.authorizationCallbackUrl,
        },
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function deleteApplication(caseName: string, applicationId: string) {
    const options = {
        url: apiUrl + `/api/user/registered/${applicationId}`,
        method: types.httpMethod.delete,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function resetClientSecret(caseName: string, applicationId: string) {
    const options = {
        url: apiUrl + `/api/user/registered/${applicationId}/client_secret`,
        method: types.httpMethod.put,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function getApplication(caseName: string, applicationId: string) {
    const options = {
        url: apiUrl + `/api/applications/${applicationId}`,
        headers,
    };
    const [, body] = await services.request.request<types.ApplicationResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result: any = libs.omit(body, "application");
    result.application = {
        name: body.application.name,
        homeUrl: body.application.homeUrl,
        description: body.application.description,
        creator: {
            name: body.application.creator!.name,
        },
    };

    await operate(caseName, result);

    return body.application;
}

async function getAccessTokens(caseName: string) {
    const options = {
        url: apiUrl + `/api/user/access_tokens`,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.AccessTokensResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result: any = libs.omit(body, "accessTokens");
    result.accessTokens = body.accessTokens.map(accessToken => {
        return {
            description: accessToken.description,
            scopes: accessToken.scopes,
        };
    });

    await operate(caseName, result);

    return body.accessTokens;
}

async function createAccessToken(caseName: string) {
    const options = {
        url: apiUrl + `/api/user/access_tokens`,
        method: types.httpMethod.post,
        headers,
        jar,
        form: {
            description: seeds.accessToken.description,
            scopes: [types.scopeNames.readUser, types.scopeNames.readOrganization],
        },
    };
    const [, body] = await services.request.request<types.AccessTokenResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result = libs.omit(body, "accessToken");

    await operate(caseName, result);

    return body.accessToken;
}

async function updateAccessToken(caseName: string, accessTokenId: string) {
    const options = {
        url: apiUrl + `/api/user/access_tokens/${accessTokenId}`,
        method: types.httpMethod.put,
        headers,
        jar,
        form: {
            description: seeds.newAccessToken.description,
            scopes: [types.scopeNames.readUser, types.scopeNames.readApplication],
        },
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function regenerateAccessToken(caseName: string, accessTokenId: string) {
    const options = {
        url: apiUrl + `/api/user/access_tokens/${accessTokenId}/value`,
        method: types.httpMethod.put,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.AccessTokenResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result = libs.omit(body, "accessToken");

    await operate(caseName, result);

    return body.accessToken;
}

async function deleteAccessToken(caseName: string, accessTokenId: string) {
    const options = {
        url: apiUrl + `/api/user/access_tokens/${accessTokenId}`,
        method: types.httpMethod.delete,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function confirm(caseName: string, code: string) {
    const options = {
        url: apiUrl + `/api/user/access_tokens/${code}`,
        method: types.httpMethod.post,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function oauthAuthorize(caseName: string, clientId: string, state: string, code: string): Promise<string> {
    const options = {
        url: apiUrl + `/oauth/authorize`,
        jar,
        qs: {
            client_id: clientId,
            scopes: [types.scopeNames.readUser, types.scopeNames.readTheme].join(),
            state,
            code,
        },
    };
    const [, body] = await services.request.request<types.OAuthAuthorizationResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result = libs.omit(body, "code");

    services.utils.assert(body.pageName !== types.oauthAuthorization.login, body);
    if (body.pageName === types.oauthAuthorization.authorization) {
        services.utils.assert(body.code, body);
        await confirm("confirm", body.code!);
        return oauthAuthorize(caseName, clientId, state, body.code!);
    }
    services.utils.assert(body.code, body);

    await operate(caseName, result);

    return body.code!;
}

async function createAccessTokenForApplication(caseName: string, clientId: string, clientSecret: string, state: string, code: string) {
    const options = {
        url: apiUrl + `/api/access_tokens`,
        method: types.httpMethod.post,
        headers,
        form: { clientId, clientSecret, state, code },
    };
    const [, body] = await services.request.request<types.AccessTokenResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result = libs.omit(body, "accessToken");
    await operate(caseName, result);

    return body.accessToken;
}

async function getAuthorizedApplications(caseName: string) {
    const options = {
        url: apiUrl + `/api/user/authorized`,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.ApplicationsResponse>(options);
    services.utils.assert(body.status === 0, body);

    const result: any = libs.omit(body, "applications");
    result.applications = body.applications.map(application => {
        return {
            name: application.name,
            homeUrl: application.homeUrl,
            description: application.description,
            creator: {
                name: application.creator!.name,
                avatar: application.creator!.email,
            },
            scopes: application.scopes,
        };
    });

    return operate(caseName, result);
}

async function revokeApplication(caseName: string, applicationId: string) {
    const options = {
        url: apiUrl + `/api/user/authorized/${applicationId}`,
        method: types.httpMethod.delete,
        headers,
        jar,
    };
    const [, body] = await services.request.request<types.Response>(options);
    services.utils.assert(body.status === 0, body);

    return operate(caseName, body);
}

async function testVersion() {
    const version = await getVersion("getVersion");

    headers[services.settings.headerNames.version] = version;
    headersWithAuthorization[services.settings.headerNames.version] = version;
}

async function resetMongodb() {
    services.mongo.connect();
    await services.mongo.User.remove({}).exec();
    await services.mongo.Organization.remove({}).exec();
    await services.mongo.Theme.remove({}).exec();
    await services.mongo.AccessToken.remove({}).exec();
    await services.mongo.Application.remove({}).exec();
    libs.mongoose.disconnect();
}

async function testClientLogin() {
    const guid = services.utils.generateUuid();
    const code = await createCaptcha(guid, "createCaptcha-client");
    return createToken(guid, code, "createToken-client", seeds.clientUser.email, seeds.clientUser.name);
}

async function testLogin() {
    const guid = services.utils.generateUuid();
    const code = await createCaptcha(guid, "createCaptcha");
    const loginUrl = await createToken(guid, code, "createToken", seeds.user.email, seeds.user.name);
    return login(loginUrl!, "login");
}

async function testRegisteredApplications() {
    await getRegisteredApplications("getRegisteredApplications");
    await registerApplication("registerApplication");

    let applications = await getRegisteredApplications("getRegisteredApplications-afterRegistered");
    services.utils.assert(applications.length > 0, applications);
    let application = applications[0];

    await updateApplication("updateApplication", application.id);
    await getRegisteredApplications("getRegisteredApplications-afterUpdated");
    await resetClientSecret("resetClientSecret", application.id);
    await getApplication("getApplication", application.id);

    applications = await getRegisteredApplications("getRegisteredApplications-afterClientSecretReset");
    services.utils.assert(applications.length > 0, applications);
    application = applications[0];

    return application;
}

async function testPrivateAccessToken() {
    await getAccessTokens("getAccessTokens");
    await createAccessToken("createAccessToken");

    const accessTokens = await getAccessTokens("getAccessTokens-afterCreated");
    services.utils.assert(accessTokens.length > 0, accessTokens);
    const accessTokenId = accessTokens[0].id;

    await updateAccessToken("updateAccessToken", accessTokenId);
    await getAccessTokens("getAccessTokens-afterUpdated");
    const accessToken = await regenerateAccessToken("regenerateAccessToken", accessTokenId);
    await getAccessTokens("getAccessTokens-afterRegenerated");
    await getCurrentUser("getCurrentUser-client-withPrivateAccessToken", accessToken);
    return accessTokenId;
}

async function testOrganization() {
    await createOrganization("createOrganization");
    await getCreatedOrganizations("getCreatedOrganizations");
    const organizations = await getJoinedOrganizations("getJoinedOrganizations");
    services.utils.assert(organizations.length > 0, organizations);
    return organizations[0].id;
}

async function testUser() {
    const user = await getCurrentUser("getCurrentUser");
    return getAvatar(user.user.id, "getAvatar");
}

async function testThemes(organizationId: string) {
    await getThemesOfOrganization(organizationId, "getThemesOfOrganization");
    await createTheme(organizationId, "createTheme");

    const themes = await getThemesOfOrganization(organizationId, "getThemesOfOrganization-afterCreated");
    services.utils.assert(themes.length > 0, themes);
    const themeId = themes[0].id;

    await unwatch(themeId, "unwatch");
    await getThemesOfOrganization(organizationId, "getThemesOfOrganization-afterUnwatched");
    await watch(themeId, "watch");
    await getThemesOfOrganization(organizationId, "getThemesOfOrganization-afterWatched");
    await updateTheme(themeId, "updateTheme");
    await getThemesOfOrganization(organizationId, "getThemesOfOrganization-afterUpdated");
}

async function testAccessToken(application: types.Application) {
    await getAuthorizedApplications("getAuthorizedApplications");
    const state = services.utils.generateUuid();
    const code = await oauthAuthorize("oauthAuthorize", application.clientId!, state, "");
    const accessToken = await createAccessTokenForApplication("createAccessTokenForApplication", application.clientId!, application.clientSecret!, state, code);
    await getAuthorizedApplications("getAuthorizedApplications-afterConfirmed");
    await getCurrentUser("getCurrentUser-client-withAccessToken", accessToken);
    await revokeApplication("revokeApplication", application.id);
    await getAuthorizedApplications("getAuthorizedApplications-afterRevoked");
}

export async function run() {
    await testVersion();

    await resetMongodb();

    const clientLoginUrl = await testClientLogin();
    await login(clientLoginUrl!, "login-client");

    const client = await getCurrentUser("getCurrentUser-client");
    await getAvatar(client.user.id, "getAvatar-client");
    await getJoinedOrganizations("getJoinedOrganizations-client");

    await getScopes("getScopes");

    const registeredApplication = await testRegisteredApplications();

    const accessTokenId = await testPrivateAccessToken();

    await logout("logout-client");

    await testLogin();

    await testUser();

    const organizationId = await testOrganization();

    await testThemes(organizationId);

    await updateUser("updateUser");
    await getCurrentUser("getCurrentUser-afterUpdated");

    await invite("invite", client.user.email!, organizationId);

    await testAccessToken(registeredApplication);

    await logout("logout");

    await login(clientLoginUrl!, "login-client-afterInvited");
    await getCurrentUser("getCurrentUser-client-afterInvited");
    await getJoinedOrganizations("getJoinedOrganizations-client-afterInvited");

    await deleteApplication("deleteApplication", registeredApplication.id);
    await getRegisteredApplications("getRegisteredApplications-afterDeleted");

    await deleteAccessToken("deleteAccessToken", accessTokenId);
    await getAccessTokens("getAccessTokens-afterDeleted");

    await logout("logout-client-afterInvited");
}
