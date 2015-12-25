import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Rate {
    remain: number;
    resetMoment: string;
}

let documentUrl = "/api/response.html";

export function route(app: libs.express.Application) {
    app.all("/api/*", async (request: libs.Request, response: libs.Response, next) => {
        await services.authenticationCredential.authenticate(request);

        if (!request.userId) {
            await services.authenticationCredential.authenticateHeader(request);
        }

        if (request.method === "GET") {
            response.setHeader("Last-Modified", new Date().toUTCString());
        }

        // no rate limit for ip in the white list.
        if (!settings.uploadIPWhiteList.get(settings.currentEnvironment).find(i => i === request.ip)) {
            let key: string;
            let errorMessage: string;
            let limit: number;

            if (request.userId) {
                if (request.method === "POST") {
                    key = settings.cacheKeys.rateLimit.contentCreation + request.userId.toHexString();
                    errorMessage = "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.";
                    limit = settings.rateLimit.contentCreation;
                } else {
                    key = settings.cacheKeys.rateLimit.userId + request.userId.toHexString();
                    errorMessage = "API rate limit exceeded for current user.";
                    limit = settings.rateLimit.user;
                }
            } else {
                key = settings.cacheKeys.rateLimit.ip + request.ip;
                errorMessage = `API rate limit exceeded for ${request.ip}, you can login to get a higher rate limit.`;
                limit = settings.rateLimit.ip;
            }

            let value = await services.cache.getStringAsync(key);

            let rate: Rate;
            if (value) {
                rate = JSON.parse(value);
                if (rate.remain <= 0) {
                    response.setHeader(settings.headerNames.rateLimit.limit, limit.toString());
                    response.setHeader(settings.headerNames.rateLimit.remain, rate.remain.toString());
                    response.setHeader(settings.headerNames.rateLimit.resetMoment, rate.resetMoment);
                    services.response.sendError(response, services.error.fromMessage(errorMessage, types.StatusCode.tooManyRequest), documentUrl);
                    return;
                }
                rate.remain--;
                services.cache.setString(key, JSON.stringify(rate));
            } else {
                rate = {
                    remain: limit - 1,
                    resetMoment: libs.moment().clone().add(1, "hours").toISOString(),
                };
                services.cache.setString(key, JSON.stringify(rate), 60 * 60);
            }

            response.setHeader(settings.headerNames.rateLimit.limit, limit.toString());
            response.setHeader(settings.headerNames.rateLimit.remain, rate.remain.toString());
            response.setHeader(settings.headerNames.rateLimit.resetMoment, rate.resetMoment);
        }

        next();
    });
}
