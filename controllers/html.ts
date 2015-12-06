"use strict";

import * as types from "../types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let frontendsServer = settings.frontendsServer.get(settings.currentEnvironment);

function redirectToErrorPage(response: libs.Response, message: string) {
    response.redirect(frontendsServer + "/error.html?" + libs.qs.stringify({ message: encodeURIComponent(message) }));
}

function setCookie(request: libs.Request, response: libs.Response, token: string) {
    if (!token) {
        response.redirect(frontendsServer + "/success.html");
    } else {
        response.cookie(settings.cookieKeys.authenticationCredential, token, {
            expires: libs.moment().clone().add(1, "months").toDate(),
            httpOnly: true,
        });

        response.redirect(frontendsServer + "/success.html?clear_previous_status=" + types.yes);
    }
}

export let documentOfLogin: types.Document = {
    url: settings.urls.login,
    method: "get",
    documentUrl: "/html.html",
};

export function login(request: libs.Request, response: libs.Response) {
    setCookie(request, response, request.query.authentication_credential);
}

export let documentOfLoginWithGithub: types.Document = {
    url: "/login_with_github",
    method: "get",
    documentUrl: "/html.html",
};

export function loginWithGithub(request: libs.Request, response: libs.Response) {
    let state = libs.generateUuid();
    services.cache.setString(settings.cacheKeys.githubLoginCode + state, "1", 10 * 60);
    response.redirect(`https://github.com/login/oauth/authorize?client_id=${settings.login.github.clientId}&scope=user:email&state=${state}`);
}

let githubCodeUrl = "/github_code";

export let documentOfGithubCode: types.Document = {
    url: githubCodeUrl,
    method: "get",
    documentUrl: "/html.html",
};

export async function githubCode(request: libs.Request, response: libs.Response) {
    try {
        interface Query {
            state: string;
            code: string;
        }

        let query: Query = request.query;

        let state = libs.validator.trim(query.state);
        let code = libs.validator.trim(query.code);

        if (state === "") {
            throw new Error("missed parameter:state");
        }

        if (code === "") {
            throw new Error("missed parameter:code");
        }

        let value = await services.cache.getStringAsync(settings.cacheKeys.githubLoginCode + state);
        if (!value) {
            throw new Error("invalid parameter:state");
        }

        let accessTokenResponse = await services.request.post<{ access_token: string; scope: string; token_type: string; }>({
            url: "https://github.com/login/oauth/access_token",
            headers: {
                Accept: "application/json"
            },
            form: {
                client_id: settings.login.github.clientId,
                client_secret: settings.login.github.clientSecret,
                code: code,
                state: state,
            },
        });

        let accessToken = accessTokenResponse.body.access_token;

        let emailsResponse = await services.request.get<{ email: string; verified: boolean; primary: boolean; }[]>({
            url: "https://api.github.com/user/emails",
            headers: {
                Authorization: `token ${accessToken}`,
                "User-Agent": "SubsNoti",
            },
        });

        let email = libs._.find(emailsResponse.body, b => {
            return b.verified && b.primary;
        });
        if (!email) {
            throw new Error("no verified email");
        }

        let verifiedEmail = email.email.toLowerCase();
        let token = await services.tokens.create(verifiedEmail, githubCodeUrl, request, verifiedEmail.split("@")[0]);

        setCookie(request, response, token);
    } catch (error) {
        redirectToErrorPage(response, error.message);
    }
}
