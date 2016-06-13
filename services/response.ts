import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

const documentServer: string = process.env.SUBS_NOTI_DOCUMENT_URL || "http://localhost:9997";

export function sendSuccess(response: libs.Response, result: Object = {}) {
    const baseResponse: types.Response = {
        status: 0,
    };

    response.status(200).json(Object.assign(baseResponse, result));
}

export function sendError(response: libs.Response, error: Error | string, documentUrl?: string) {
    let errorMessage: string;
    let stack: string;
    if (typeof error === "string") {
        errorMessage = error;
    } else {
        errorMessage = services.error.unexpectedError;
        stack = error.stack;
    }
    const baseResponse: types.Response = {
        status: 1,
        errorMessage,
        documentUrl: documentServer + (documentUrl || response.documentUrl),
    };

    if (services.settings.currentEnvironment !== types.environment.production) {
        baseResponse.stack = stack;
    }

    services.logger.logError(error);

    response.status(200).json(baseResponse);
}
