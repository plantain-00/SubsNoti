import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

const documentUrl = "/api/request/parameters.html";

export const documentOfGet: types.Document = {
    url: services.settings.urls.version,
    method: types.httpMethod.get,
    documentUrl: "/api/version.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    const result: types.VersionResult = {
        version: services.settings.version,
    };

    services.response.sendSuccess(response, result);
}

export function route(app: libs.express.Application) {
    app.all("/api/*", (request: libs.Request, response: libs.Response, next: Function) => {
        if (request.path === services.settings.urls.version && request.method === "GET") {
            next();
            return;
        }
        const version = request.header(services.settings.headerNames.version);
        request.v = typeof version === "string" ? libs.validator.trim(version) : "";

        if (request.v === "") {
            services.response.sendError(response, libs.util.format(services.error.parameterIsMissed, services.settings.headerNames.version), documentUrl);
        } else if (!libs.semver.valid(request.v)) {
            services.response.sendError(response, libs.util.format(services.error.parameterIsInvalid, services.settings.headerNames.version), documentUrl);
        } else {
            next();
        }
    });
}

export function isNotExpired(version: string, versionRange: string, expiredDate: string): boolean {
    return libs.semver.satisfies(version, versionRange) && libs.moment().isBefore(libs.moment(expiredDate));
}
