import * as libs from "../libs";

export function logRequest(url: string, request: libs.Request) {
    const data: any = {
        time: libs.moment().format(),
        type: "http request",
        content: {
            url,
        },
    };

    if (!libs.isEmpty(request.params)) {
        data.content.params = request.params;
    }
    if (!libs.isEmpty(request.body)) {
        data.content.body = request.body;
    }
    if (!libs.isEmpty(request.query)) {
        data.content.query = request.query;
    }

    console.log(JSON.stringify(data));
}

export function logError(object: Object) {
    const data = {
        time: libs.moment().format(),
        type: "error",
        content: object,
    };

    console.log(JSON.stringify(data));
}

export function logInfo(object: Object) {
    const data = {
        time: libs.moment().format(),
        type: "info",
        content: object,
    };

    console.log(JSON.stringify(data));
}
