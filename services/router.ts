import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export function bind(document: types.Document, handler: (request: libs.Request, response: libs.Response) => Promise<void>, app: libs.express.Application) {
    (app as any)[document.method](document.url, async (request: libs.Request, response: libs.Response) => {
        response.documentUrl = document.documentUrl;
        try {
            await handler(request, response);
        } catch (error) {
            services.response.sendError(response, error);
        }
    });
}

export function bindObsolete(document: types.ObsoleteDocument, handler: (request: libs.Request, response: libs.Response) => Promise<void>, app: libs.express.Application) {
    (app as any)[document.method](document.url, async (request: libs.Request, response: libs.Response) => {
        if (services.version.isNotExpired(request.v, document.versionRange, document.expiredDate)) {
            response.documentUrl = document.documentUrl;
            try {
                await handler(request, response);
            } catch (error) {
                services.response.sendError(response, error);
            }
        } else {
            services.response.sendError(response, "the api of this version is expired", document.documentUrl);
        }
    });
}
