"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let documentUrl = "/api/request/parameters.html";

export function route(app: libs.express.Application) {
    app.all("/api/*", (request: libs.Request, response: libs.Response, next) => {
        let v = libs.validator.trim(request.header(settings.headerNames.version));
        if (request.path === settings.urls.login && request.method === "GET") {
            next();
        } else if (v === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage(settings.headerNames.version), documentUrl);
        } else if (!libs.semver.valid(v)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage(settings.headerNames.version), documentUrl);
        } else {
            request.v = v;
            next();
        }
    });
}

export function isNotExpired(version: string, versionRange: string, expiredDate: string): boolean {
    return libs.semver.satisfies(version, versionRange) && libs.moment().isBefore(libs.moment(expiredDate));
}
