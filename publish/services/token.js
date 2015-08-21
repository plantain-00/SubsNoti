var libs = require("../libs");
var settings = require("../settings");
var services = require("../services/services");
function generate(userId, salt) {
    var milliseconds = new Date().getTime().toString(16);
    return libs.md5(salt + milliseconds + userId) + "g" + milliseconds + "g" + userId.toString(16);
}
exports.generate = generate;
function validate(token, next) {
    if (settings.config.environment == "development") {
        next(null);
        return;
    }
    if (!token || typeof token != "string") {
        next(new Error("invalid token"));
        return;
    }
    var tmp = token.split("g");
    if (tmp.length != 3) {
        next(new Error("invalid token"));
        return;
    }
    var milliseconds = parseInt(tmp[1], 16);
    var userId = parseInt(tmp[2], 16);
    var now = new Date().getTime();
    if (now < milliseconds
        || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
        next(new Error("token is out of date"));
        return;
    }
    services.user.getById(userId, function (error, user) {
        if (error) {
            next(error);
            return;
        }
        if (!user) {
            next(new Error("invalid user"));
            return;
        }
        if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
            next(null);
        }
        else {
            next(new Error("invalid token"));
        }
    });
}
exports.validate = validate;
//# sourceMappingURL=token.js.map