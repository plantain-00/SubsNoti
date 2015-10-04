import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function log(url: string, request: libs.Request) {
    let data: any = {
        time: new Date(),
        content: {
            url: url
        }
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

    let log = new services.mongo.Logs(data);
    log.save();
}