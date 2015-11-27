"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let documentUrl = "/api/Parameters.html";
let versionHeaderName = "X-Version";

export function route(app: libs.Application) {
    app.all("/api/*", (request: libs.Request, response: libs.Response, next) => {
        let v = libs.validator.trim(request.header(versionHeaderName));
        if (request.path === settings.config.urls.login && request.method === "GET") {
            next();
            return;
        }

        if (v === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage(versionHeaderName), documentUrl);
            return;
        }

        if (!libs.semver.valid(v)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage(versionHeaderName), documentUrl);
            return;
        }

        request.v = v;
        next();
    });
}

export function isNotExpired(version: string, versionRange: string, expiredDate: string): boolean {
    return libs.semver.satisfies(version, versionRange) && libs.moment().isBefore(libs.moment(expiredDate));
}
