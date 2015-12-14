import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function bind(document: types.Document, handler: (request: libs.Request, response: libs.Response) => void, app: libs.express.Application) {
    app[document.method](document.url, (request: libs.Request, response: libs.Response) => {
        response.documentUrl = document.documentUrl;
        handler(request, response);
    });
}

export function bindObsolete(document: types.ObsoleteDocument, handler: (request: libs.Request, response: libs.Response) => void, app: libs.express.Application) {
    app[document.method](document.url, (request: libs.Request, response: libs.Response) => {
        if (services.version.isNotExpired(request.v, document.versionRange, document.expiredDate)) {
            response.documentUrl = document.documentUrl;
            handler(request, response);
        } else {
            services.response.sendError(response, services.error.fromMessage("the api of this version is expired", types.StatusCode.notFound), document.documentUrl);
        }
    });
}
