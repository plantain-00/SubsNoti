import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function connect(next:(error:Error, logs:libs.Collection)=>void) {
    libs.mongodb.MongoClient.connect(settings.config.mongodb.url, (error, db)=> {
        if (error) {
            next(error, null);
            return;
        }

        db.authenticate(settings.config.mongodb.user, settings.config.mongodb.password, (error)=> {
            if (error) {
                next(error, null);
                return;
            }

            services.logger.logs = db.collection("logs");
            next(null, services.logger.logs);
        });
    });
}