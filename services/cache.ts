import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

const client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, {});

client.on("error", error=> {
    console.log(error);
});

export function getString(key:string, next:(error:Error, reply:string)=>void) {
    client.get(key, (error, reply)=> {
        next(error, reply);
    });
}

export function setString(key:string, value:string) {
    client.set(key, value);
}

export function set(key:string, value:any) {
    client.hmset(key, value);
}

export function get(key:string, field:string, next:(error:Error, reply:any)=>void) {
    client.hmget(key, field, (error, reply)=> {
        next(error, reply);
    });
}