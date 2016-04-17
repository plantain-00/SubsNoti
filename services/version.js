"use strict";
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
const documentUrl = "/api/request/parameters.html";
function route(app) {
    app.all("/api/*", (request, response, next) => {
        if (request.path === settings.urls.version && request.method === "GET") {
            next();
            return;
        }
        const version = request.header(settings.headerNames.version);
        request.v = typeof version === "string" ? libs.validator.trim(version) : "";
        if (request.v === "") {
            services.response.sendError(response, services.error.fromParameterIsMissedMessage(settings.headerNames.version), documentUrl);
        }
        else if (!libs.semver.valid(request.v)) {
            services.response.sendError(response, services.error.fromParameterIsInvalidMessage(settings.headerNames.version), documentUrl);
        }
        else {
            next();
        }
    });
}
exports.route = route;
function isNotExpired(version, versionRange, expiredDate) {
    return libs.semver.satisfies(version, versionRange) && libs.moment().isBefore(libs.moment(expiredDate));
}
exports.isNotExpired = isNotExpired;
