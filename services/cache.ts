import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export let client:libs.RedisClient;

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

export function ttl(key:string, next:(error:Error, reply:number)=>void) {
    client.ttl(key, (error, reply)=> {
        next(error, reply);
    })
}