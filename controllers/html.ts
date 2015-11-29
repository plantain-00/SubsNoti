"use strict";

import * as types from "../types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

function redirectToErrorPage(response: libs.Response, message: string, remoteAddress: string) {
    response.redirect(remoteAddress + "/error.html?message=" + encodeURIComponent(message));
}

function setCookie(request: libs.Request, response: libs.Response, token: string, remoteAddress: string) {
    if (!token) {
        response.redirect(remoteAddress + "/success.html");
        return;
    }

    response.cookie(settings.config.cookieKeys.authenticationCredential, token, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true,
    });

    response.redirect(remoteAddress + "/success.html?clear_previous_status=√");
}

export let documentOfLogin: types.Document = {
    url: settings.config.urls.login,
    method: "get",
    documentUrl: "/html.html",
};

export function login(request: libs.Request, response: libs.Response) {
    setCookie(request, response, request.query.authentication_credential, request.connection.remoteAddress);
}

export let documentOfLoginWithGithub: types.Document = {
    url: "/login_with_github",
    method: "get",
    documentUrl: "/html.html",
};

export function loginWithGithub(request: libs.Request, response: libs.Response) {
    let state = libs.generateUuid();
    let remoteAddress = request.connection.remoteAddress;
    services.cache.setString(settings.config.cacheKeys.githubLoginCode + state, remoteAddress, 10 * 60);
    response.redirect(`https://github.com/login/oauth/authorize?client_id=${settings.config.login.github.clientId}&scope=user:email&state=${state}`);
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
        redirectToErrorPage(response, "missed parameter:state", "");
        return;
    }

    if (code === "") {
        redirectToErrorPage(response, "missed parameter:code", "");
        return;
    }

    let remoteAddress = await services.cache.getStringAsync(settings.config.cacheKeys.githubLoginCode + state);
    if (!remoteAddress) {
        redirectToErrorPage(response, "invalid parameter:state", remoteAddress);
        return;
    }

    try {
        let accessTokenResponse = await services.request.post<{ access_token: string; scope: string; token_type: string; }>({
            url: "https://github.com/login/oauth/access_token",
            headers: {
                Accept: "application/json"
            },
            form: {
                client_id: settings.config.login.github.clientId,
                client_secret: settings.config.login.github.clientSecret,
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
            redirectToErrorPage(response, "no verified email", remoteAddress);
            return;
        }

        let verifiedEmail = email.email.toLowerCase();

        let token = await services.tokens.create(verifiedEmail, githubCodeUrl, request);

        setCookie(request, response, token, remoteAddress);
    } catch (error) {
        redirectToErrorPage(response, error.message, "");
    }
}
