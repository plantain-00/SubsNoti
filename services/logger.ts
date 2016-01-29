import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function logRequest(url: string, request: libs.Request) {
    let data: any = {
        time: new Date(),
        content: {
            url: url
        },
    };

    if (!libs._.isEmpty(request.params)) {
        data.content.params = request.params;
    }
    if (!libs._.isEmpty(request.body)) {
        data.content.body = request.body;
    }
    if (!libs._.isEmpty(request.query)) {
        data.content.query = request.query;
    }

    let log = new services.mongo.Log(data);
    log.save();
}

export function logError(error: types.E) {
    let data = {
        time: new Date(),
        content: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            statusCode: error.statusCode,
        },
    };

    // show the error in pm2 logs
    console.log(libs.colors.red(JSON.stringify(data, null, "  ")));

    let log = new services.mongo.Log(data);
    log.save();
}

export function logInfo(info: string) {
    let data = {
        time: new Date(),
        content: {
            info: info
        },
    };

    // show the info in pm2 logs
    console.log(libs.colors.green(JSON.stringify(data, null, "  ")));

    let log = new services.mongo.Log(data);
    log.save();
}
