"use strict";
const libs = require("../libs");
const services = require("../services");
function logRequest(url, request) {
    const data = {
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
    const log = new services.mongo.Log(data);
    log.save();
}
exports.logRequest = logRequest;
function logError(error) {
    const data = {
        time: new Date(),
        content: {
            name: error.name,
            message: error.message,
            stack: error.stack,
            statusCode: error.statusCode,
        },
    };
    // show the error in pm2 logs
    libs.red(`${new Date()}: ${JSON.stringify(data, null, "  ")}`);
    const log = new services.mongo.Log(data);
    log.save();
}
exports.logError = logError;
function logInfo(info) {
    const data = {
        time: new Date(),
        content: {
            info: info
        },
    };
    // show the info in pm2 logs
    libs.green(`${new Date()}: ${JSON.stringify(data, null, "  ")}`);
    const log = new services.mongo.Log(data);
    log.save();
}
exports.logInfo = logInfo;
