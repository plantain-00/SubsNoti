"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
let client;
function connect() {
    client = new libs.Redis(settings.redis.port, settings.redis.host, settings.redis.options);
    client.on("error", error => {
        services.logger.logError(error);
    });
}
exports.connect = connect;
// key
function exists(key) {
    return client.exists(key);
}
exports.exists = exists;
function get(key) {
    return client.get(key);
}
exports.get = get;
function ttl(key) {
    return client.ttl(key);
}
exports.ttl = ttl;
function set(key, value, expire) {
    if (expire) {
        client.set(key, value, "EX", expire);
    }
    else {
        client.set(key, value);
    }
}
exports.set = set;
function del(key) {
    return client.del(key);
}
exports.del = del;
function expire(key, seconds) {
    return client.expire(key, seconds);
}
exports.expire = expire;
function decr(key) {
    return client.decr(key);
}
exports.decr = decr;
function incrby(key, increment) {
    client.incrby(key, increment);
}
exports.incrby = incrby;
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
function hincrby(key, field, increment) {
    client.hincrby(key, field, increment);
}
exports.hincrby = hincrby;
function hget(key, field) {
    return client.hget(key, field);
}
exports.hget = hget;
function hgetall(key) {
    return client.hgetall(key);
}
exports.hgetall = hgetall;
function hmget(key, fields) {
    return client.hmget(key, fields);
}
exports.hmget = hmget;
// set
function sismember(key, member) {
    return client.sismember(key, member);
}
exports.sismember = sismember;
function sadd(key, member) {
    client.sadd(key, member);
}
exports.sadd = sadd;
function srem(key, member) {
    client.srem(key, member);
}
exports.srem = srem;
// sorted set
function zadd(key, score, member) {
    client.zadd(key, score, member);
}
exports.zadd = zadd;
function zrem(key, member) {
    client.zrem(key, member);
}
exports.zrem = zrem;
function zscore(key, member) {
    return client.zscore(key, member);
}
exports.zscore = zscore;
function zrangebyscore(key, offset, count) {
    return client.zrangebyscore(key, "-inf", "+inf", "LIMIT", offset, count);
}
exports.zrangebyscore = zrangebyscore;
function zrangebyscoreWithScores(key, offset, count) {
    return __awaiter(this, void 0, Promise, function* () {
        const raw = yield client.zrangebyscore(key, "-inf", "+inf", "WITHSCORES", "LIMIT", offset, count);
        const result = [];
        for (let i = 0; i < raw.length; i += 2) {
            result.push({
                member: raw[i],
                score: +raw[i + 1],
            });
        }
        return result;
    });
}
exports.zrangebyscoreWithScores = zrangebyscoreWithScores;
// list
function lrange(key, start, stop) {
    return client.lrange(key, start, stop);
}
exports.lrange = lrange;
function llen(key) {
    return __awaiter(this, void 0, Promise, function* () {
        const length = yield client.llen(key);
        return +length;
    });
}
exports.llen = llen;
function lpush(key, value) {
    client.lpush(key, value);
}
exports.lpush = lpush;
function rpop(key) {
    return client.rpop(key);
}
exports.rpop = rpop;
