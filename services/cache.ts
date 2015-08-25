import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

export var client:libs.RedisClient;

export function getString(key:string, next:(error:Error, reply:string)=>void) {
    client.get(key, (error, reply)=> {
        next(error, reply);
    });
}

export function setString(key:string, value:string, seconds?:number) {
    client.set(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}

export function set(key:string, value:any, seconds?:number) {
    client.hmset(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}

export function get(key:string, field:string, next:(error:Error, reply:any)=>void) {
    client.hmget(key, field, (error, reply)=> {
        next(error, reply);
    });
}