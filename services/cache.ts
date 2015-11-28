"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let client: libs.RedisClient;

export function connect() {
    client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, settings.config.redis.options);
    client.on("error", error => {
        console.log(error);
    });
}

export function getStringAsync(key: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        client.get(key, (error: Error, reply) => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
                return;
            }
            resolve(reply);
        });
    });
}

export function setString(key: string, value: string, seconds?: number) {
    client.set(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}

function set(key: string, value: any, seconds?: number) {
    client.hmset(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}

function getAsync(key: string, field: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        client.hmget(key, field, (error: Error, reply) => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
                return;
            }
            resolve(reply);
        });
    });
}

/**
 * query the remain time of a cache.
 */
export function ttlAsync(key: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        client.ttl(key, (error: Error, reply) => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
                return;
            }
            resolve(reply);
        });
    });
}

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
