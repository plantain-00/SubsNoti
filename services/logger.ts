import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

var logs:libs.Collection;

libs.mongodb.MongoClient.connect(settings.config.mongodb.url, (error, db)=> {
    if (error) {
        console.log(error);
        return;
    }

    db.authenticate(settings.config.mongodb.user, settings.config.mongodb.password, (error)=> {
        if (error) {
            console.log(error);
            return;
        }

        logs = db.collection("logs");
    });
});

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