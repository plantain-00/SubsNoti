import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let client: libs.redis.RedisClient;

export function connect() {
    let redis = settings.redis.get(settings.currentEnvironment);
    client = libs.redis.createClient(redis.port, redis.host, redis.options);
    client.on("error", error => {
        console.log(libs.colors.red(error));
    });
}

export function getStringAsync(key: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        client.get(key, (error: Error, reply) => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
            } else {
                resolve(reply);
            }
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
            } else {
                resolve(reply);
            }
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
            } else {
                resolve(reply);
            }
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
