import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function get(request:libs.Request, response:libs.Response, documentUrl:string, next:(error:Error, user:interfaces.User)=>void) {
    if (settings.config.environment == "development") {
        next(null, {
            id: 1,
            name: "test",
            emailHead: "test",
            emailTail: "test.com",
            salt: libs.generateUuid(),
            status: enums.UserStatus.normal
        });
        return;
    }

    const authenticationCredential = request.cookies[services.cookieKey.authenticationCredential];
    if (!authenticationCredential || typeof authenticationCredential != "string") {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    services.cache.getString(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential), (error, reply)=> {
        if (error) {
            next(error, null);
            return;
        }

        if (reply) {
            const userFromCache:interfaces.User = JSON.parse(reply);
            next(null, userFromCache);
            return;
        }

        const tmp = authenticationCredential.split("g");
        if (tmp.length != 3) {
            next(new Error("invalid authentication credential"), null);
            return;
        }

        const milliseconds = parseInt(tmp[1], 16);
        const userId = parseInt(tmp[2], 16);
        const now = new Date().getTime();

        if (now < milliseconds
            || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
            next(new Error("authentication credential is out of date"), null);
            return;
        }

        services.user.getById(userId, (error, user)=> {
            if (error) {
                next(error, null);
                return;
            }

            if (!user) {
                next(new Error("invalid user"), null);
                return;
            }

            if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
                services.cache.setString(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential), JSON.stringify(user), 8 * 60 * 60);
                next(null, user);
            } else {
                next(new Error("invalid authentication credential"), null);
            }
        });
    });
}
