import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

export function limit(key:string, seconds:number, next:(error:Error)=>void) {
    services.cache.getString(key, (error, value)=> {
        if (error) {
            next(error);
            return;
        }

        if (value) {
            next(new Error("do it later after " + seconds + " seconds"));
            return;
        }

        services.cache.setString(key, "frequency", seconds);
        next(null);
    });
}