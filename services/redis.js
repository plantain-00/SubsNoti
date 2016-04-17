"use strict";
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
function zrangebyscore(key, withScores, offset, count) {
    if (withScores) {
        return client.zrangebyscore(key, "-inf", "+inf", "WITHSCORES", "LIMIT", offset, count);
    }
    return client.zrangebyscore(key, "-inf", "+inf", "LIMIT", offset, count);
}
exports.zrangebyscore = zrangebyscore;
// list
function lrange(key, start, stop) {
    return client.lrange(key, start, stop);
}
exports.lrange = lrange;
