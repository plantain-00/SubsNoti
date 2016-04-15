import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let client: IORedis.Redis;

export function connect() {
    const redis = settings.redis.get(settings.currentEnvironment);
    client = new libs.Redis(redis.port, redis.host, redis.options);
    client.on("error", error => {
        services.logger.logError(error);
    });
}

// key

export function exists(key: string | number): Promise<boolean> {
    return client.exists(key);
}
export function get(key: string | number): Promise<string> {
    return client.get(key);
}
export function ttl(key: string | number): Promise<number> {
    return client.ttl(key);
}
export function set(key: string | number, value: string | number, expire?: number) {
    if (expire) {
        client.set(key, value, "EX", expire);
    } else {
        client.set(key, value);
    }
}
export function del(key: string | number): Promise<number> {
    return client.del(key);
}
export function expire(key: string | number, seconds: number): Promise<number> {
    return client.expire(key, seconds);
}
export function decr(key: string | number): Promise<number> {
    return client.decr(key);
}

// sub/pub

// export function subscribe(channel: string | number) {
//     subClient.subscribe(channel);
// }
// export function unsubscribe(channel: string | number) {
//     subClient.unsubscribe(channel);
// }
// export function publish(channel: string | number, message: string | number) {
//     pubClient.publish(channel, message);
// }

// hash

export function hincrby(key: string | number, field: string | number, increment: number) {
    client.hincrby(key, field, increment);
}
export function hget(key: string | number, field: string | number): Promise<string> {
    return client.hget(key, field);
}
export function hgetall<T>(key: string | number): Promise<T> {
    return client.hgetall(key);
}

// set

export function sismember(key: string | number, member: string | number): Promise<boolean> {
    return client.sismember(key, member);
}
export function sadd(key: string | number, member: string | number) {
    client.sadd(key, member);
}
export function srem(key: string | number, member: string | number) {
    client.srem(key, member);
}

// sorted set

export function zadd(key: string | number, score: number, member: string | number) {
    client.zadd(key, score, member);
}
export function zrem(key: string | number, member: string | number) {
    client.zrem(key, member);
}
export function zscore(key: string | number, member: string | number): Promise<number> {
    return client.zscore(key, member);
}
export function zrangebyscore(key: string | number, withScores: boolean, offset: number, count: number): Promise<string[]> {
    if (withScores) {
        return client.zrangebyscore(key, "-inf", "+inf", "WITHSCORES", "LIMIT", offset, count);
    }
    return client.zrangebyscore(key, "-inf", "+inf", "LIMIT", offset, count);
}
