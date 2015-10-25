'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let client: libs.RedisClient;

export function connect() {
    client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, settings.config.redis.options);
    client.on("error", error=> {
        console.log(error);
    });
}

function getString(key: string, next: (error: interfaces.E, reply: string) => void) {
    client.get(key, (error: Error, reply) => {
        next(services.error.fromError(error, enums.StatusCode.internalServerError), reply);
    });
}

export let getStringAsync = services.promise.promisify2<string, string>(getString);

export function setString(key: string, value: string, seconds?: number) {
    client.set(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}

export function set(key: string, value: any, seconds?: number) {
    client.hmset(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}

function get(key: string, field: string, next: (error: interfaces.E, reply) => void) {
    client.hmget(key, field, (error: Error, reply) => {
        next(services.error.fromError(error, enums.StatusCode.internalServerError), reply);
    });
}

export let getAsync = services.promise.promisify3<string, string, any>(get);

function ttl(key: string, next: (error: interfaces.E, reply: number) => void) {
    client.ttl(key, (error: Error, reply) => {
        next(services.error.fromError(error, enums.StatusCode.internalServerError), reply);
    });
}

export let ttlAsync = services.promise.promisify2<string, number>(ttl);

export function deleteKeyAsync(key: string): Promise<void> {
    return deleteKeysAsync([key]);
}

export function deleteKeysAsync(keys: string[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        client.del(keys, () => {
            return resolve();
        });
    });
}
