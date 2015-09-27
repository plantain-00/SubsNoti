import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export let logs: libs.Collection;

function log(url: string, request: libs.Request, next: (error: Error) => void) {
    const data: any = {
        url: url,
        time: new Date()
    };

    if (!libs._.isEmpty(request.params)) {
        data.params = request.params;
    }
    if (!libs._.isEmpty(request.body)) {
        data.body = request.body;
    }
    if (!libs._.isEmpty(request.query)) {
        data.query = request.query;
    }

    logs.insertOne(data, next);
}

export const logAsync = libs.Promise.promisify(log);