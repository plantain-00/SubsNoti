import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function limit(key:string, seconds:number, next:(error:Error)=>void) {
    services.cache.getString(services.cacheKeyRule.getFrequency(key), (error, value)=> {
        if (error) {
            next(error);
            return;
        }

        if (value) {
            next(new Error("do it later after " + seconds + " seconds"));
            return;
        }

        services.cache.setString(services.cacheKeyRule.getFrequency(key), key, seconds);
        next(null);
    });
}