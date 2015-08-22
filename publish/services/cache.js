var libs = require("../libs");
var settings = require("../settings");
var client = libs.redis.createClient(settings.config.redis.port, settings.config.redis.host, settings.config.redis.options);
client.on("error", function (error) {
    console.log(error);
});
function getString(key, next) {
    client.get(key, function (error, reply) {
        next(error, reply);
    });
}
exports.getString = getString;
function setString(key, value, seconds) {
    client.set(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}
exports.setString = setString;
function set(key, value, seconds) {
    client.hmset(key, value);
    if (seconds) {
        client.expire(key, seconds);
    }
}
exports.set = set;
function get(key, field, next) {
    client.hmget(key, field, function (error, reply) {
        next(error, reply);
    });
}
exports.get = get;
//# sourceMappingURL=cache.js.map