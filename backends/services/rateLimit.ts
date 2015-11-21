"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Rate {
    remain: number;
    resetMoment: string;
}

let documentUrl = "/doc/api/Response.html";

export function route(app: libs.Application) {
    app.all("/api/*", async (request: libs.Request, response: libs.Response, next) => {
        let userId = await services.authenticationCredential.authenticate(request);

        request.userId = userId;

        if (userId) {
            let key = settings.config.cacheKeys.rateLimit.userId + userId.toHexString();
            let value = await services.cache.getStringAsync(key);

            let rate: Rate;
            if (value) {
                rate = JSON.parse(value);
                if (rate.remain <= 0) {
                    services.response.sendError(response, services.error.fromMessage("API rate limit exceeded for current user.", types.StatusCode.tooManyRequest), documentUrl);
                    return;
                }
                rate.remain--;
                services.cache.setString(key, JSON.stringify(rate));
            } else {
                rate = {
                    remain: settings.config.rateLimit.user - 1,
                    resetMoment: libs.moment().clone().add(1, "hours").toISOString(),
                };
                services.cache.setString(key, JSON.stringify(rate), 60 * 60);
            }

            response.setHeader("X-RateLimit-Limit", settings.config.rateLimit.user.toString());
            response.setHeader("X-RateLimit-Remain", rate.remain.toString());
            response.setHeader("X-RateLimit-ResetMoment", rate.resetMoment);
        } else {
            let key = settings.config.cacheKeys.rateLimit.ip + request.ip;
            let value = await services.cache.getStringAsync(key);

            let rate: Rate;
            if (value) {
                rate = JSON.parse(value);
                if (rate.remain <= 0) {
                    services.response.sendError(response, services.error.fromMessage(`API rate limit exceeded for ${request.ip}, you can login to get a higher rate limit.`, types.StatusCode.tooManyRequest), documentUrl);
                    return;
                }
                rate.remain--;
                services.cache.setString(key, JSON.stringify(rate));
            } else {
                rate = {
                    remain: settings.config.rateLimit.ip - 1,
                    resetMoment: libs.moment().clone().add(1, "hours").toISOString(),
                };
                services.cache.setString(key, JSON.stringify(rate), 60 * 60);
            }

            response.setHeader("X-RateLimit-Limit", settings.config.rateLimit.ip.toString());
            response.setHeader("X-RateLimit-Remain", rate.remain.toString());
            response.setHeader("X-RateLimit-ResetMoment", rate.resetMoment);
        }

        next();
    });
}
