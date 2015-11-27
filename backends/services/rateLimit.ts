"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

interface Rate {
    remain: number;
    resetMoment: string;
}

let documentUrl = "/api/Response.html";

export function route(app: libs.Application) {
    app.all("/api/*", async (request: libs.Request, response: libs.Response, next) => {
        let userId = await services.authenticationCredential.authenticate(request);

        request.userId = userId;

        if (request.method === "GET") {
            response.setHeader("Last-Modified", new Date().toUTCString());
        }

        let key: string;
        let errorMessage: string;
        let limit: number;

        if (userId) {
            if (request.method === "POST") {
                key = settings.config.cacheKeys.rateLimit.contentCreation + userId.toHexString();
                errorMessage = "You have triggered an abuse detection mechanism and have been temporarily blocked from content creation. Please retry your request again later.";
                limit = settings.config.rateLimit.contentCreation;
            } else {
                key = settings.config.cacheKeys.rateLimit.userId + userId.toHexString();
                errorMessage = "API rate limit exceeded for current user.";
                limit = settings.config.rateLimit.user;
            }
        } else {
            key = settings.config.cacheKeys.rateLimit.ip + request.ip;
            errorMessage = `API rate limit exceeded for ${request.ip}, you can login to get a higher rate limit.`;
            limit = settings.config.rateLimit.ip;
        }

        let value = await services.cache.getStringAsync(key);

        let rate: Rate;
        if (value) {
            rate = JSON.parse(value);
            if (rate.remain <= 0) {
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

        response.setHeader("X-RateLimit-Limit", limit.toString());
        response.setHeader("X-RateLimit-Remain", rate.remain.toString());
        response.setHeader("X-RateLimit-ResetMoment", rate.resetMoment);

        next();
    });
}
