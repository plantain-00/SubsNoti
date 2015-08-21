import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

export function generate(userId:number, salt:string):string {
    const milliseconds = new Date().getTime().toString(16);
    return libs.md5(salt + milliseconds + userId) + "g" + milliseconds + "g" + userId.toString(16);
}

export function validate(token:string, next:(error:Error)=>void) {
    if (settings.config.environment == "development") {
        next(null);
        return;
    }

    if (!token || typeof token != "string") {
        next(new Error("invalid token"));
        return;
    }

    const tmp = token.split("g");
    if (tmp.length != 3) {
        next(new Error("invalid token"));
        return;
    }

    const milliseconds = parseInt(tmp[1], 16);
    const userId = parseInt(tmp[2], 16);
    const now = new Date().getTime();

    if (now < milliseconds
        || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
        next(new Error("token is out of date"));
        return;
    }

    services.user.getById(userId, (error, user)=> {
        if (error) {
            next(error);
            return;
        }

        if (!user) {
            next(new Error("invalid user"));
            return;
        }

        if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
            next(null);
        } else {
            next(new Error("invalid token"));
        }
    });
}
