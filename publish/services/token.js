var libs = require("../libs");
var settings = require("../settings");
var services = require("../services/services");
function generate(userId, salt) {
    var milliseconds = new Date().getTime();
    return libs.md5(salt + milliseconds + userId) + "g" + milliseconds.toString(16) + "g" + userId.toString(16);
}
exports.generate = generate;
function validate(request, response, documentUrl, next) {
    if (settings.config.environment == "development") {
        next(null, null);
        return;
    }
    var token = request.cookies["token"];
    if (!token || typeof token != "string") {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    services.cache.getString("user_" + token, function (error, reply) {
        if (error) {
            next(error, null);
            return;
        }
        if (reply) {
            var userFromCache = JSON.parse(reply);
            next(null, userFromCache);
            return;
        }
        var tmp = token.split("g");
        if (tmp.length != 3) {
            next(new Error("invalid token"), null);
            return;
        }
        var milliseconds = parseInt(tmp[1], 16);
        var userId = parseInt(tmp[2], 16);
        var now = new Date().getTime();
        if (now < milliseconds
            || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
            next(new Error("token is out of date"), null);
            return;
        }
        services.user.getById(userId, function (error, user) {
            if (error) {
                next(error, null);
                return;
            }
            if (!user) {
                next(new Error("invalid user"), null);
                return;
            }
            if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
                services.cache.setString("user_" + token, JSON.stringify(user), 8 * 60 * 60);
                next(null, user);
            }
            else {
                next(new Error("invalid token"), null);
            }
        });
    });
}
exports.validate = validate;
//# sourceMappingURL=token.js.map