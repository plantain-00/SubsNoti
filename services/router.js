"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("../share/types");
const services = require("../services");
function bind(document, handler, app) {
    app[document.method](document.url, (request, response) => __awaiter(this, void 0, void 0, function* () {
        response.documentUrl = document.documentUrl;
        try {
            yield handler(request, response);
        }
        catch (error) {
            services.response.sendError(response, error);
        }
    }));
}
exports.bind = bind;
function bindObsolete(document, handler, app) {
    app[document.method](document.url, (request, response) => __awaiter(this, void 0, void 0, function* () {
        if (services.version.isNotExpired(request.v, document.versionRange, document.expiredDate)) {
            response.documentUrl = document.documentUrl;
            try {
                yield handler(request, response);
            }
            catch (error) {
                services.response.sendError(response, error);
            }
        }
        else {
            services.response.sendError(response, services.error.fromMessage("the api of this version is expired", 404 /* notFound */), document.documentUrl);
        }
    }));
}
exports.bindObsolete = bindObsolete;
