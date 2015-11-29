"use strict";

import * as types from "../types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

function redirectToErrorPage(response: libs.Response, message: string) {
    response.redirect(settings.frontEndsServer + "/error.html?message=" + encodeURIComponent(message));
}

function setCookie(request: libs.Request, response: libs.Response, token: string) {
    if (!token) {
        response.redirect(settings.frontEndsServer + "/success.html");
        return;
    }

    response.cookie(settings.cookieKeys.authenticationCredential, token, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true,
    });

    response.redirect(settings.frontEndsServer + "/success.html?clear_previous_status=√");
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
    let state = libs.validator.trim(request.query.state);
    let code = libs.validator.trim(request.query.code);

    if (state === "") {
        redirectToErrorPage(response, "missed parameter:state");
        return;
    }

    if (code === "") {
        redirectToErrorPage(response, "missed parameter:code");
        return;
    }

    let value = await services.cache.getStringAsync(settings.cacheKeys.githubLoginCode + state);
    if (!value) {
        redirectToErrorPage(response, "invalid parameter:state");
        return;
    }

    try {
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
        }, types.responseType.json);

        let email = libs._.find(emailsResponse.body, b => {
            return b.verified && b.primary;
        });
        if (!email) {
            redirectToErrorPage(response, "no verified email");
            return;
        }

        let verifiedEmail = email.email.toLowerCase();

        let token = await services.tokens.create(verifiedEmail, githubCodeUrl, request);

        setCookie(request, response, token);
    } catch (error) {
        redirectToErrorPage(response, error.message);
    }
}
