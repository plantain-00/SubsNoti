import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function bind(document: types.Document, handler: (request: libs.Request, response: libs.Response) => Promise<void>, app: libs.express.Application) {
    app[document.method](document.url, async (request: libs.Request, response: libs.Response) => {
        response.documentUrl = document.documentUrl;
        try {
            await handler(request, response);
        } catch (error) {
            services.response.sendError(response, error);
        }
    });
}

export function bindObsolete(document: types.ObsoleteDocument, handler: (request: libs.Request, response: libs.Response) => Promise<void>, app: libs.express.Application) {
    app[document.method](document.url, async (request: libs.Request, response: libs.Response) => {
        if (services.version.isNotExpired(request.v, document.versionRange, document.expiredDate)) {
            response.documentUrl = document.documentUrl;
            try {
                await handler(request, response);
            } catch (error) {
                services.response.sendError(response, error);
            }
        } else {
            services.response.sendError(response, services.error.fromMessage("the api of this version is expired", types.StatusCode.notFound), document.documentUrl);
        }
    });
}
