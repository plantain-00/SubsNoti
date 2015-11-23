"use strict";

import * as types from "../common/types";

import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

import * as user from "./controllers/user";
import * as userLoggedIn from "./controllers/user/logged_in";
import * as userJoined from "./controllers/user/joined";
import * as userCreated from "./controllers/user/created";
import * as userWatched from "./controllers/user/watched";
import * as usersJoined from "./controllers/users/joined";
import * as tokens from "./controllers/tokens";
import * as organizationsThemes from "./controllers/organizations/themes";
import * as themes from "./controllers/themes";
import * as organizations from "./controllers/organizations";
import * as captcha from "./controllers/captcha";

function setCookie(request: libs.Request, response: libs.Response, token: string) {
    if (!token) {
        response.redirect("/index.html");
        return;
    }

    response.cookie(settings.config.cookieKeys.authenticationCredential, token, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true,
    });

    response.redirect("/index.html?clear_previous_status=√");
}

export function route(app: libs.Application) {
    services.rateLimit.route(app);
    services.version.route(app);

    services.router.bind(user.documentOfGet, user.get, app);
    services.router.bind(user.documentOfUpdate, user.update, app);

    services.router.bind(userLoggedIn.documentOfDelete, userLoggedIn.deleteThis, app);

    services.router.bind(userJoined.documentOfGet, userJoined.get, app);
    services.router.bind(usersJoined.documentOfInvite, usersJoined.invite, app);

    services.router.bind(userCreated.documentOfGet, userCreated.get, app);

    services.router.bind(organizations.documentOfCreate, organizations.create, app);

    services.router.bind(userWatched.documentOfWatch, userWatched.watch, app);
    services.router.bind(userWatched.documentOfUnwatch, userWatched.unwatch, app);

    services.router.bind(tokens.documentOfCreate, tokens.create, app);

    services.router.bind(organizationsThemes.documentOfGet, organizationsThemes.get, app);

    services.router.bind(themes.documentOfCreate, themes.create, app);
    services.router.bind(themes.documentOfUpdate, themes.update, app);

    services.router.bind(captcha.documentOfCreate, captcha.create, app);

    services.router.bindObsolete(userJoined.documentOfUserJoinedOrganization, userJoined.get, app);
    services.router.bindObsolete(userCreated.documentOfUserCreatedOrganizations, userCreated.get, app);
    services.router.bindObsolete(usersJoined.documentOfObsoleteInvite, usersJoined.invite, app);
    services.router.bindObsolete(tokens.documentOfSendToken, tokens.create, app);
    services.router.bindObsolete(userWatched.obsoleteDocumentOfWatch, userWatched.watch, app);
    services.router.bindObsolete(userWatched.obsoleteDocumentOfUnwatch, userWatched.unwatch, app);

    app.get(settings.config.urls.login, (request: libs.Request, response: libs.Response) => {
        setCookie(request, response, request.query.authentication_credential);
    });

    app.get("/login_with_github", (request: libs.Request, response: libs.Response) => {
        let state = libs.generateUuid();
        services.cache.setString(settings.config.cacheKeys.githubLoginCode + state, "1", 10 * 60);
        response.redirect(`https://github.com/login/oauth/authorize?client_id=${settings.config.login.github.clientId}&scope=user:email&state=${state}`);
    });

    let githubCodeUrl = "/github_code";
    app.get(githubCodeUrl, async (request: libs.Request, response: libs.Response) => {
        let state = libs.validator.trim(request.query.state);
        let code = libs.validator.trim(request.query.code);

        if (state === "") {
            services.response.redirectToErrorPage(response, "missed parameter:state");
            return;
        }

        if (code === "") {
            services.response.redirectToErrorPage(response, "missed parameter:code");
            return;
        }

        let value = await services.cache.getStringAsync(settings.config.cacheKeys.githubLoginCode + state);
        if (!value) {
            services.response.redirectToErrorPage(response, "invalid parameter:state");
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
                services.response.redirectToErrorPage(response, "no verified email");
                return;
            }

            let verifiedEmail = email.email.toLowerCase();

            let token = await services.tokens.create(verifiedEmail, githubCodeUrl, request);

            setCookie(request, response, token);
        } catch (error) {
            services.response.redirectToErrorPage(response, error.message);
        }
    });
}
