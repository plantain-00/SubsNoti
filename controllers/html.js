"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../share/types");
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
function redirectToErrorPage(response, message) {
    response.redirect(settings.frontendsServer + "/error.html?" + libs.qs.stringify({ message: encodeURIComponent(message) }));
}
function setCookie(request, response, token, redirectUrl) {
    if (!token) {
        response.redirect(settings.frontendsServer + "/success.html");
    }
    else {
        response.cookie(settings.cookieKeys.authenticationCredential, token, {
            expires: libs.moment().clone().add(1, "months").toDate(),
            httpOnly: true,
            domain: settings.cookieDomains,
            secure: settings.currentEnvironment === types.environment.production,
        });
        response.redirect(settings.frontendsServer + "/success.html?" + libs.qs.stringify({
            clear_previous_status: types.yes,
            redirect_url: redirectUrl,
        }));
    }
}
exports.documentOfLogin = {
    url: settings.urls.login,
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};
function login(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        setCookie(request, response, request.query.authentication_credential, request.query.redirect_url);
    });
}
exports.login = login;
exports.documentOfLoginWithGithub = {
    url: "/login_with_github",
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};
function loginWithGithub(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const state = libs.generateUuid();
        services.redis.set(settings.cacheKeys.githubLoginCode + state, "1", 10 * 60);
        response.redirect(`https://github.com/login/oauth/authorize?client_id=${settings.login.github.clientId}&scope=user:email&state=${state}`);
    });
}
exports.loginWithGithub = loginWithGithub;
exports.documentOfGithubCode = {
    url: "/github_code",
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};
function githubCode(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = request.query;
            const state = typeof query.state === "string" ? libs.validator.trim(query.state) : "";
            const code = typeof query.code === "string" ? libs.validator.trim(query.code) : "";
            if (state === "") {
                throw new Error("missed parameter:state");
            }
            if (code === "") {
                throw new Error("missed parameter:code");
            }
            const value = yield services.redis.get(settings.cacheKeys.githubLoginCode + state);
            if (!value) {
                throw new Error("invalid parameter:state");
            }
            const accessTokenResponse = yield services.request.post({
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
            const emailsResponse = yield services.request.get({
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
            const token = yield services.tokens.create(verifiedEmail, exports.documentOfGithubCode.url, request, verifiedEmail.split("@")[0]);
            setCookie(request, response, token);
        }
        catch (error) {
            redirectToErrorPage(response, error.message);
        }
    });
}
exports.githubCode = githubCode;
exports.documentOfAuthorize = {
    url: "/oauth/authorize",
    method: types.httpMethod.get,
    documentUrl: "/html.html",
};
function authorize(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = request.query;
            const clientId = typeof query.client_id === "string" ? libs.validator.trim(query.client_id) : "";
            const scopes = typeof query.scopes === "string" ? libs.validator.trim(query.scopes) : "";
            const state = typeof query.state === "string" ? libs.validator.trim(query.state) : "";
            if (clientId === "") {
                throw new Error("missed parameter:clientId");
            }
            if (state === "") {
                throw new Error("missed parameter:state");
            }
            yield services.authenticationCredential.authenticate(request);
            // if not logged in, redirected to login page, keep `client_id`, `scopes` and `state` as parameters, then retry this.
            if (!request.userId) {
                if (settings.currentEnvironment === types.environment.test) {
                    const result = {
                        pageName: types.oauthAuthorization.login
                    };
                    services.response.sendSuccess(response, 200 /* OK */, result);
                    return;
                }
                response.redirect("/login.html?" + libs.qs.stringify({
                    redirect_url: exports.documentOfAuthorize.url + "?" + libs.qs.stringify(query)
                }));
                return;
            }
            const application = yield services.mongo.Application.findOne({ clientId: clientId })
                .exec();
            if (!application) {
                throw new Error("invalid client id");
            }
            // after authorized, there is a code in `query`, check that in cache
            if (query.code) {
                const value = yield services.redis.get(settings.cacheKeys.oauthLoginCode + query.code);
                if (value) {
                    const json = JSON.parse(value);
                    if (json.confirmed) {
                        if (settings.currentEnvironment === types.environment.test) {
                            const result = {
                                code: query.code
                            };
                            services.response.sendSuccess(response, 200 /* OK */, result);
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
            const accessToken = yield services.mongo.AccessToken.findOne({
                creator: request.userId,
                application: application._id,
            }).exec();
            const scopeArray = scopes === "" ? [] : scopes.split(",");
            if (accessToken) {
                // if access token was generated, that is, already authorized, check whether the application need more scopes or not
                const newScopes = libs.difference(scopeArray, accessToken.scopes);
                if (newScopes.length === 0) {
                    // if no more scopes, authorization is not needed
                    const value = {
                        scopes: scopeArray,
                        creator: request.userId.toHexString(),
                        application: application._id.toHexString(),
                        state: state,
                        confirmed: true,
                    };
                    services.redis.set(settings.cacheKeys.oauthLoginCode + query.code, JSON.stringify(value), 30 * 60);
                    if (settings.currentEnvironment === types.environment.test) {
                        const result = {
                            code: query.code
                        };
                        services.response.sendSuccess(response, 200 /* OK */, result);
                        return;
                    }
                    response.redirect(application.authorizationCallbackUrl + "?" + libs.qs.stringify({
                        code: query.code,
                        state: state,
                    }));
                    return;
                }
            }
            const value = {
                scopes: scopeArray,
                creator: request.userId.toHexString(),
                application: application._id.toHexString(),
                state: state,
                confirmed: false,
            };
            services.redis.set(settings.cacheKeys.oauthLoginCode + query.code, JSON.stringify(value), 30 * 60);
            // if not confirmed, redirected to authorization page
            if (settings.currentEnvironment === types.environment.test) {
                const result = {
                    pageName: types.oauthAuthorization.authorization,
                    code: query.code,
                };
                services.response.sendSuccess(response, 200 /* OK */, result);
                return;
            }
            response.redirect("/authorization.html?" + libs.qs.stringify({
                redirect_url: exports.documentOfAuthorize.url + "?" + libs.qs.stringify(query),
                scopes: scopes,
                code: query.code,
                application_id: application._id.toHexString(),
            }));
        }
        catch (error) {
            if (settings.currentEnvironment === types.environment.test) {
                services.response.sendError(response, error, exports.documentOfAuthorize.documentUrl);
                return;
            }
            redirectToErrorPage(response, error.message);
        }
    });
}
exports.authorize = authorize;
