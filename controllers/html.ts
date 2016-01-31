import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

const frontendsServer = settings.frontendsServer.get(settings.currentEnvironment);

function redirectToErrorPage(response: libs.Response, message: string) {
    response.redirect(frontendsServer + "/error.html?" + libs.qs.stringify({ message: encodeURIComponent(message) }));
}

function setCookie(request: libs.Request, response: libs.Response, token: string, redirectUrl?: string) {
    if (!token) {
        response.redirect(frontendsServer + "/success.html");
    } else {
        response.cookie(settings.cookieKeys.authenticationCredential, token, {
            expires: libs.moment().clone().add(1, "months").toDate(),
            httpOnly: true,
            domain: settings.cookieDomains.get(settings.currentEnvironment),
            secure: settings.currentEnvironment === types.environment.production,
        });

        response.redirect(frontendsServer + "/success.html?" + libs.qs.stringify({
            clear_previous_status: types.yes,
            redirect_url: redirectUrl,
        }));
    }
}

export const documentOfLogin: types.Document = {
    url: settings.urls.login,
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};

export async function login(request: libs.Request, response: libs.Response) {
    setCookie(request, response, request.query.authentication_credential, request.query.redirect_url);
}

export const documentOfLoginWithGithub: types.Document = {
    url: "/login_with_github",
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};

export async function loginWithGithub(request: libs.Request, response: libs.Response) {
    const state = libs.generateUuid();
    services.cache.set(settings.cacheKeys.githubLoginCode + state, "1", 10 * 60);
    response.redirect(`https://github.com/login/oauth/authorize?client_id=${settings.login.github.clientId}&scope=user:email&state=${state}`);
}

export const documentOfGithubCode: types.Document = {
    url: "/github_code",
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};

export async function githubCode(request: libs.Request, response: libs.Response) {
    try {
        interface Query {
            state: string;
            code: string;
        }

        const query: Query = request.query;

        const state = libs.validator.trim(query.state);
        const code = libs.validator.trim(query.code);

        if (state === "") {
            throw new Error("missed parameter:state");
        }

        if (code === "") {
            throw new Error("missed parameter:code");
        }

        const value = await services.cache.getAsync(settings.cacheKeys.githubLoginCode + state);
        if (!value) {
            throw new Error("invalid parameter:state");
        }

        const accessTokenResponse = await services.request.post<{ access_token: string; scope: string; token_type: string; }>({
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

        const accessToken = accessTokenResponse.body.access_token;

        const emailsResponse = await services.request.get<{ email: string; verified: boolean; primary: boolean; }[]>({
            url: "https://api.github.com/user/emails",
            headers: {
                Authorization: `token ${accessToken}`,
                "User-Agent": "SubsNoti",
            },
        });

        const email = emailsResponse.body.find(b => {
            return b.verified && b.primary;
        });
        if (!email) {
            throw new Error("no verified email");
        }

        const verifiedEmail = email.email.toLowerCase();
        const token = await services.tokens.create(verifiedEmail, documentOfGithubCode.url, request, verifiedEmail.split("@")[0]);

        setCookie(request, response, token);
    } catch (error) {
        redirectToErrorPage(response, error.message);
    }
}

export const documentOfAuthorize: types.Document = {
    url: "/oauth/authorize",
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};

export async function authorize(request: libs.Request, response: libs.Response) {
    interface Query {
        client_id: string;
        scopes: string;
        state: string;
        code: string;
    }

    try {
        const query: Query = request.query;

        const clientId = libs.validator.trim(query.client_id);
        const scopes = libs.validator.trim(query.scopes);
        const state = libs.validator.trim(query.state);

        if (clientId === "") {
            throw new Error("missed parameter:clientId");
        }

        if (state === "") {
            throw new Error("missed parameter:state");
        }

        await services.authenticationCredential.authenticate(request);

        // if not logged in, redirected to login page, keep `client_id`, `scopes` and `state` as parameters, then retry this.
        if (!request.userId) {
            if (settings.currentEnvironment === types.environment.test) {
                const result: types.OAuthAuthorizationResult = {
                    pageName: types.oauthAuthorization.login
                };
                services.response.sendSuccess(response, types.StatusCode.OK, result);
                return;
            }
            response.redirect("/login.html?" + libs.qs.stringify({
                redirect_url: documentOfAuthorize.url + "?" + libs.qs.stringify(query)
            }));
            return;
        }

        const application = await services.mongo.Application.findOne({ clientId: clientId })
            .exec();
        if (!application) {
            throw new Error("invalid client id");
        }

        // after authorized, there is a code in `query`, check that in cache
        if (query.code) {
            const value = await services.cache.getAsync(settings.cacheKeys.oauthLoginCode + query.code);
            if (value) {
                const json: types.OAuthCodeValue = JSON.parse(value);
                if (json.confirmed) {
                    if (settings.currentEnvironment === types.environment.test) {
                        const result: types.OAuthAuthorizationResult = {
                            code: query.code
                        };
                        services.response.sendSuccess(response, types.StatusCode.OK, result);
                        return;
                    }
                    response.redirect(application.authorizationCallbackUrl + "?" + libs.qs.stringify({
                        code: query.code,
                        state: state,
                    }));
                    return;
                }
            }
        }

        query.code = libs.generateUuid();

        const accessToken = await services.mongo.AccessToken.findOne({
            creator: request.userId,
            application: application._id,
        }).exec();

        const scopeArray = scopes.split(",");

        if (accessToken) {
            // if access token was generated, that is, already authorized, check whether the application need more scopes or not
            const newScopes = libs._.difference(scopeArray, accessToken.scopes);
            if (newScopes.length === 0) {
                // if no more scopes, authorization is not needed
                const value: types.OAuthCodeValue = {
                    scopes: scopeArray,
                    creator: request.userId.toHexString(),
                    application: application._id.toHexString(),
                    state: state,
                    confirmed: true,
                };
                services.cache.set(settings.cacheKeys.oauthLoginCode + query.code, JSON.stringify(value), 30 * 60);

                if (settings.currentEnvironment === types.environment.test) {
                    const result: types.OAuthAuthorizationResult = {
                        code: query.code
                    };
                    services.response.sendSuccess(response, types.StatusCode.OK, result);
                    return;
                }
                response.redirect(application.authorizationCallbackUrl + "?" + libs.qs.stringify({
                    code: query.code,
                    state: state,
                }));
                return;
            }
        }

        const value: types.OAuthCodeValue = {
            scopes: scopeArray,
            creator: request.userId.toHexString(),
            application: application._id.toHexString(),
            state: state,
            confirmed: false,
        };
        services.cache.set(settings.cacheKeys.oauthLoginCode + query.code, JSON.stringify(value), 30 * 60);

        // if not confirmed, redirected to authorization page
        if (settings.currentEnvironment === types.environment.test) {
            const result: types.OAuthAuthorizationResult = {
                pageName: types.oauthAuthorization.authorization,
                code: query.code,
            };
            services.response.sendSuccess(response, types.StatusCode.OK, result);
            return;
        }
        response.redirect("/authorization.html?" + libs.qs.stringify({
            redirect_url: documentOfAuthorize.url + "?" + libs.qs.stringify(query),
            scopes: scopes,
            code: query.code,
            application_id: application._id.toHexString(),
        }));
    } catch (error) {
        if (settings.currentEnvironment === types.environment.test) {
            services.response.sendError(response, error, documentOfAuthorize.documentUrl);
            return;
        }
        redirectToErrorPage(response, error.message);
    }
}
