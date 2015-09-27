import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export function get(request: libs.Request, response: libs.Response, documentUrl: string): libs.Promise<interfaces.User> {
    if (settings.config.environment == "development") {
        const user: interfaces.User = {
            id: 1,
            name: "test",
            emailHead: "test",
            emailTail: "test.com",
            salt: libs.generateUuid(),
            status: enums.UserStatus.normal
        };
        return services.organization.getByCreatorId(user.id).then(organizationIds=> {
            user.createdOrganizationIds = organizationIds;

            return libs.Promise.resolve(user);
        });
    }

    const authenticationCredential = request.cookies[services.cookieKey.authenticationCredential];
    if (!authenticationCredential || typeof authenticationCredential != "string") {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    return services.cache.getStringAsync(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential)).then(reply=> {
        if (reply) {
            const userFromCache: interfaces.User = JSON.parse(reply);
            return libs.Promise.resolve(userFromCache);
        }

        const tmp = authenticationCredential.split("g");
        if (tmp.length != 3) {
            return libs.Promise.reject(new Error("invalid authentication credential"));
        }

        const milliseconds = parseInt(tmp[1], 16);
        const userId = parseInt(tmp[2], 16);
        const now = new Date().getTime();

        if (now < milliseconds
            || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
            return libs.Promise.reject(new Error("authentication credential is out of date"));
        }

        return services.user.getById(userId).then(user=> {
            if (!user) {
                return libs.Promise.reject(new Error("invalid user"));
            }

            if (libs.md5(user.salt + milliseconds + userId) == tmp[0]) {
                return services.organization.getByCreatorId(user.id).then(organizationIds=> {
                    user.createdOrganizationIds = organizationIds;

                    services.cache.setString(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential), JSON.stringify(user), 8 * 60 * 60);

                    return libs.Promise.resolve(user);
                });
            } else {
                return libs.Promise.reject(new Error("invalid authentication credential"));
            }
        });
    });
}
