"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let publicOrganizationId: libs.ObjectId;
export let publicOrganizationName = "public";

export function route(app: libs.Application) {
    app.all("/api/*", (request: libs.Request, response: libs.Response, next) => {
        let v = libs.validator.trim(request.query.v);

        if (v === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage("v"), "/doc/api/Parameters.html");
            return;
        }

        if (!libs.semver.valid(v)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage("v"), "/doc/api/Parameters.html");
            return;
        }

        request.v = v;
        next();
    });
}

export function match(version: string, versionRange: string, expiredDate: string): boolean {
    return libs.semver.satisfies(version, versionRange) || libs.moment().isAfter(libs.moment(expiredDate));
}
