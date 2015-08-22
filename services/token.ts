import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

export function generate(userId:number, salt:string):string {
    const milliseconds = new Date().getTime();
    return libs.md5(salt + milliseconds + userId) + "g" + milliseconds.toString(16) + "g" + userId.toString(16);
}

export function validate(request:libs.Request, response:libs.Response, documentUrl:string, next:(error:Error, user:models.User)=>void) {
    if (settings.config.environment == "development") {
        next(null, null);
        return;
    }

    const token = request.cookies["token"];
    if (!token || typeof token != "string") {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    services.cache.getString("user_" + token, (error, reply)=> {
        if (error) {
            next(error, null);
            return;
        }

        if (reply) {
            var userFromCache:models.User = JSON.parse(reply);
            next(null, userFromCache);
            return;
        }

        const tmp = token.split("g");
        if (tmp.length != 3) {
            next(new Error("invalid token"), null);
            return;
        }

        const milliseconds = parseInt(tmp[1], 16);
        const userId = parseInt(tmp[2], 16);
        const now = new Date().getTime();

        if (now < milliseconds
            || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
            next(new Error("token is out of date"), null);
            return;
        }

        services.user.getById(userId, (error, user)=> {
            if (error) {
                next(error, null);
                return;
            }

            if (!user) {
                next(new Error("invalid user"), null);
                return;
            }

            if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
                services.cache.setString("user_" + token, JSON.stringify(user), 8 * 60 * 60);
                next(null, user);
            } else {
                next(new Error("invalid token"), null);
            }
        });
    });
}
