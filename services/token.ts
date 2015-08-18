import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import services = require("../services/services");

export function generate(password:string, strategy = null):{
    result:string;
    milliseconds:string} {
    var milliseconds = new Date().getTime().toString(16);
    if (strategy == null) {
        return {
            result: libs.md5(password + milliseconds),
            milliseconds: milliseconds
        }
    }
    return {
        result: libs.md5(password + milliseconds + strategy),
        milliseconds: milliseconds
    };
}

export function isValid(password:string, milliseconds:string, result:string, timeSpan:number, strategy:string = null):boolean {
    var s = parseInt(milliseconds, 16);
    if (new Date().getTime() < s
        || new Date().getTime() > s + timeSpan) {
        return false;
    }
    if (strategy == null) {
        return libs.md5(password + milliseconds) == result;
    }
    return libs.md5(password + milliseconds + strategy) == result;
}

export function validate(token:string, password:string, next:(error)=>void) {
    if (settings.config.environment == "development") {
        next(null);
        return;
    }
    if (!token || typeof token != "string") {
        next(new Error("wrong token"));
        return;
    }
    const tmp = token.split("g");
    if (tmp.length != 3) {
        next(new Error("wrong token"));
        return;
    }

    if (isValid(password, tmp[1], tmp[0], 30 * 24 * 60 * 60 * 1000)) {
        next(null);
    } else {
        next(new Error("token is invalid or out of date"));
    }
}