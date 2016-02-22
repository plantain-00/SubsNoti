import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Rate {
    remain: number;
    resetMoment: string;
}

const fields = {
    remain: "remain_",
    resetMoment: "resetMoment_",
};
const documentUrl = "/api/response.html";

export function route(app: libs.express.Application) {
    app.all("/api/*", async (request: libs.Request, response: libs.Response, next) => {
        await services.authenticationCredential.authenticate(request);

        if (!request.userId) {
            await services.authenticationCredential.authenticateHeader(request);
        }

        if (request.method === "GET") {
            response.setHeader("Last-Modified", new Date().toUTCString());
        }

        // do not limit rate when in test environment
        if (settings.currentEnvironment === types.environment.test) {
            next();
            return;
        }

        let remainKey: string;
        let resetMomentKey: string;
        let errorMessage: string;
        let limit: number;

        // get key, error message and total limit for current request
        if (request.userId) {
            if (request.method === "POST") {
                remainKey = settings.cacheKeys.rateLimit.contentCreation + fields.remain + request.userId.toHexString();
                resetMomentKey = settings.cacheKeys.rateLimit.contentCreation + fields.resetMoment + request.userId.toHexString();
                errorMessage = "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.";
                limit = settings.rateLimit.contentCreation;
            } else {
                remainKey = settings.cacheKeys.rateLimit.userId + fields.remain + request.userId.toHexString();
                resetMomentKey = settings.cacheKeys.rateLimit.userId + fields.resetMoment + request.userId.toHexString();
                errorMessage = "API rate limit exceeded for current user.";
                limit = settings.rateLimit.user;
            }
        } else {
            remainKey = settings.cacheKeys.rateLimit.ip + fields.remain + request.ip;
            resetMomentKey = settings.cacheKeys.rateLimit.ip + fields.resetMoment + request.ip;
            errorMessage = `API rate limit exceeded for ${request.ip}, you can login to get a higher rate limit.`;
            limit = settings.rateLimit.ip;
        }

        function setHeaders(remain: number, resetMoment: string) {
            response.setHeader(settings.headerNames.rateLimit.limit, limit.toString());
            response.setHeader(settings.headerNames.rateLimit.remain, remain.toString());
            response.setHeader(settings.headerNames.rateLimit.resetMoment, resetMoment);
        }

        let remainString: string = await services.cache.getAsync(remainKey);

        if (remainString !== null) {
            let remain = +remainString;
            let resetMoment = await services.cache.getAsync(resetMomentKey);
            if (remain <= 0) {
                setHeaders(remain, resetMoment);
                services.response.sendError(response, services.error.fromMessage(errorMessage, types.StatusCode.tooManyRequest), documentUrl);
                return;
            }
            services.cache.client.decr(remainKey);
            setHeaders(remain - 1, resetMoment);
        } else {
            let resetMoment = libs.moment().clone().add(1, "hours").toISOString();
            services.cache.set(remainKey, limit - 1, 60 * 60);
            services.cache.set(resetMomentKey, resetMoment, 60 * 60);
            setHeaders(limit - 1, resetMoment);
        }

        next();
    });
}
