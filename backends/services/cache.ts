'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let client: libs.RedisClient;

export function getStringAsync(key: string): Promise<string> {
    return new Promise((resolve, reject) => {
        client.get(key, (error: Error, reply) => {
            return error !== null ? reject(error) : resolve(reply);
        });
    });
};

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

export function getAsync(key: string, field: string): Promise<any> {
    return new Promise((resolve, reject) => {
        client.hmget(key, field, (error: Error, reply) => {
            return error !== null ? reject(error) : resolve(reply);
        });
    });
};

export function ttlAsync(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
        client.ttl(key, (error: Error, reply) => {
            return error !== null ? reject(error) : resolve(reply);
        });
    });
}
