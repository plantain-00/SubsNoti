import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

const documentUrl = "/api/request/parameters.html";

export function route(app: libs.express.Application) {
    app.all("/api/*", (request: libs.Request, response: libs.Response, next) => {
        if (request.path === settings.urls.version && request.method === "GET") {
            next();
            return;
        }
        const version = request.header(settings.headerNames.version);
        request.v = typeof version === "string" ? libs.validator.trim(version) : "";

        if (request.v === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage(settings.headerNames.version), documentUrl);
        } else if (!libs.semver.valid(request.v)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage(settings.headerNames.version), documentUrl);
        } else {
            next();
        }
    });
}

export function isNotExpired(version: string, versionRange: string, expiredDate: string): boolean {
    return libs.semver.satisfies(version, versionRange) && libs.moment().isBefore(libs.moment(expiredDate));
}
