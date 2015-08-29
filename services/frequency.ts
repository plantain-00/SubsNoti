import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function limit(key:string, seconds:number, next:(error:Error)=>void) {
    const frequencyKey = services.cacheKeyRule.getFrequency(key);
    services.cache.getString(frequencyKey, (error, value)=> {
        if (error) {
            next(error);
            return;
        }

        if (value) {
            services.cache.ttl(frequencyKey, (error, reply)=> {
                if (error) {
                    next(error);
                    return;
                }

                next(new Error("do it later after " + reply + " seconds"));
            });
            return;
        }

        services.cache.setString(services.cacheKeyRule.getFrequency(key), key, seconds);
        next(null);
    });
}