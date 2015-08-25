import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

export var logs:libs.Collection;

export function log(url:string, request:libs.Request, next:(error:Error)=>void) {
    var data:any = {
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