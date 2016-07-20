import * as libs from "../libs";
import * as services from "../services";

let client: libs.Redis.Redis;
export const config = {
    host: process.env.SUBS_NOTI_REDIS_HOST || "localhost",
    port: process.env.SUBS_NOTI_REDIS_PORT || 6379,
    options: {
        pass: process.env.SUBS_NOTI_REDIS_PASSWORD,
    },
};

export function connect() {
    client = new libs.Redis(config.port, config.host, config.options);
    client.on("error", (error: Error) => {
        services.logger.logError(error);
    });
}

// key

export function exists(key: string | number): Promise<boolean> {
    return client.exists(key);
}
export function expire(key: string | number, seconds: number): Promise<number> {
    return client.expire(key, seconds);
}
export function del(key: string | number): Promise<number> {
    return client.del(key);
}
export function ttl(key: string | number): Promise<number> {
    return client.ttl(key);
}
// export function pexpire(key: string | number, milliseconds: number) {
//     client.pexpire(key, milliseconds);
// }

// string

export function get(key: string | number): Promise<string> {
    return client.get(key);
}
export function set(key: string | number, value: string | number, expire?: number) {
    if (expire) {
        client.set(key, value, "EX", expire);
    } else {
        client.set(key, value);
    }
}
export async function decr(key: string | number): Promise<number> {
    return +(await client.decr(key));
}
export function incrby(key: string | number, increment: number) {
    client.incrby(key, increment);
}
export async function incr(key: string | number): Promise<number> {
    return +(await client.incr(key));
}
export function setPX(key: string | number, value: string | number, pexpire: number) {
    client.set(key, value, "PX", pexpire);
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

export function hexists(key: string | number, field: string | number): Promise<number> {
    return client.hexists(key, field);
}
export function hincrby(key: string | number, field: string | number, increment: number): Promise<string> {
    return client.hincrby(key, field, increment);
}
export function hget(key: string | number, field: string | number): Promise<string> {
    return client.hget(key, field);
}
export function hgetall(key: string | number): Promise<{ [field: string]: string }> {
    return client.hgetall(key);
}
export function hmget(key: string | number, ...fields: (string | number)[]): Promise<string[]> {
    return client.hmget(key, fields);
}
export function hset(key: string | number, field: string | number, value: string | number) {
    client.hset(key, field, value);
}
export function hdel(key: string | number, field: string | number) {
    client.hdel(key, field);
}

// set

export function sismember(key: string | number, member: string | number): Promise<boolean> {
    return client.sismember(key, member);
}
export function sadd(key: string | number, ...members: (string | number)[]) {
    client.sadd(key, ...members);
}
export function srem(key: string | number, ...members: (string | number)[]) {
    client.srem(key, ...members);
}
export function smembers(key: string | number): Promise<string[]> {
    return client.smembers(key);
}
export async function scard(key: string | number): Promise<number> {
    return +(await client.scard(key));
}
export function spop(key: string | number, count: number): Promise<string[]> {
    return client.spop(key, count);
}
export function srandmember(key: string | number, count?: number): Promise<string[]> {
    return client.srandmember(key, count);
}

// sorted set

export function zadd(key: string | number, score: number, member: string | number) {
    client.zadd(key, score, member);
}
export function zrem(key: string | number, member: string | number) {
    client.zrem(key, member);
}
export function zscore(key: string | number, member: string | number): Promise<string> {
    return client.zscore(key, member);
}
export function zrank(key: string | number, member: string | number): Promise<string> {
    return client.zrank(key, member);
}
export async function zcard(key: string | number): Promise<number> {
    return +(await client.zcard(key));
}
export function zrevrank(key: string | number, member: string | number): Promise<string> {
    return client.zrevrank(key, member);
}
export function zincrby(key: string | number, increment: number, member: string | number): Promise<string> {
    return client.zincrby(key, increment, member);
}
export function zrangebyscore(key: string | number, offset: number, count: number): Promise<string[]> {
    return client.zrangebyscore(key, "-inf", "+inf", "LIMIT", offset, count);
}
export function zrangebyscoreNoLimit(key: string | number): Promise<string[]> {
    return client.zrangebyscore(key, "-inf", "+inf");
}
export async function zrangebyscoreWithScores(key: string | number, offset: number, count: number): Promise<{ member: string, score: number }[]> {
    const raw: string[] = await client.zrangebyscore(key, "-inf", "+inf", "WITHSCORES", "LIMIT", offset, count);
    const result: { member: string, score: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
        result.push({
            member: raw[i],
            score: +raw[i + 1],
        });
    }
    return result;
}
export function zrevrangebyscore(key: string | number, offset: number, count: number): Promise<string[]> {
    return client.zrevrangebyscore(key, "+inf", "-inf", "LIMIT", offset, count);
}
export function zrevrangebyscoreNoLimit(key: string | number): Promise<string[]> {
    return client.zrevrangebyscore(key, "+inf", "-inf");
}
export async function zrevrangebyscoreWithScores(key: string | number, offset: number, count: number): Promise<{ member: string, score: number }[]> {
    const raw: string[] = await client.zrevrangebyscore(key, "+inf", "-inf", "WITHSCORES", "LIMIT", offset, count);
    const result: { member: string, score: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
        result.push({
            member: raw[i],
            score: +raw[i + 1],
        });
    }
    return result;
}
export async function zrevrangebyscoreWithScoresNoLimit(key: string | number): Promise<{ member: string, score: number }[]> {
    const raw: string[] = await client.zrevrangebyscore(key, "+inf", "-inf", "WITHSCORES");
    const result: { member: string, score: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
        result.push({
            member: raw[i],
            score: +raw[i + 1],
        });
    }
    return result;
}
export async function zrangebyscoreWithScoresNoLimit(key: string | number): Promise<{ member: string, score: number }[]> {
    const raw: string[] = await client.zrangebyscore(key, "-inf", "+inf", "WITHSCORES");
    const result: { member: string, score: number }[] = [];
    for (let i = 0; i < raw.length; i += 2) {
        result.push({
            member: raw[i],
            score: +raw[i + 1],
        });
    }
    return result;
}

// list

export function lrange(key: string | number, start: number, stop: number): Promise<string[]> {
    return client.lrange(key, start, stop);
}
export async function llen(key: string | number): Promise<number> {
    const length = await client.llen(key);
    return +length;
}
export function lpush(key: string | number, value: string | number) {
    client.lpush(key, value);
}
export function rpop(key: string | number): Promise<string> {
    return client.rpop(key);
}
export function ltrim(key: string | number, start: number, stop: number) {
    client.ltrim(key, start, stop);
}
