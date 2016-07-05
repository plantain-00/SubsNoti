import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

const documentUrl = "/api/response.html";

export function route(app: libs.express.Application) {
    app.all("/api/*", async (request: libs.Request, response: libs.Response, next: Function) => {
        await services.authenticationCredential.authenticate(request);

        if (!request.userId) {
            await services.authenticationCredential.authenticateHeader(request);
        }

        if (request.method === "GET") {
            response.setHeader("Last-Modified", new Date().toUTCString());
        }

        // do not limit rate when in test environment
        if (services.settings.currentEnvironment === types.environment.test) {
            next();
            return;
        }

        if (request.userId) {
            if (request.method === "POST") {
                const key = services.settings.cacheKeys.rateLimit.contentCreation + request.userId.toHexString();
                const count = await services.redis.incr(key);
                response.setHeader("X-Count", count.toString());
                if (count === 1) {
                    services.redis.expire(key, 60 * 60);
                } else if (count > services.settings.rateLimit.contentCreation) {
                    services.response.sendError(response, "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.", documentUrl);
                    return;
                }
            } else {
                const key = services.settings.cacheKeys.rateLimit.userId + request.userId.toHexString();
                const count = await services.redis.incr(key);
                response.setHeader("X-Count", count.toString());
                if (count === 1) {
                    services.redis.expire(key, 60 * 60);
                } else if (count > services.settings.rateLimit.user) {
                    services.response.sendError(response, "API rate limit exceeded for current user.", documentUrl);
                    return;
                }
            }
        } else {
            const ip = services.ip.getFromHttp(request);
            const key = services.settings.cacheKeys.rateLimit.ip + ip;
            const count = await services.redis.incr(key);
            response.setHeader("X-Count", count.toString());
            if (count === 1) {
                services.redis.expire(key, 60 * 60);
            } else if (count > services.settings.rateLimit.ip) {
                services.response.sendError(response, `API rate limit exceeded for ${ip}, you can login to get a higher rate limit.`, documentUrl);
                return;
            }
        }

        next();
    });
}
