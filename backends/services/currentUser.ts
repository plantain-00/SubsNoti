import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function get(request: libs.Request, documentUrl: string): libs.Promise<interfaces.User> {
    let authenticationCredential = request.cookies[services.cookieKey.authenticationCredential];
    if (!authenticationCredential || typeof authenticationCredential != "string") {
        return libs.Promise.reject(new Error("no authentication credential"));
    }

    return services.cache.getStringAsync(services.cacheKeyRule.getAuthenticationCredential(authenticationCredential)).then(reply=> {
        if (reply) {
            let userFromCache: interfaces.User = JSON.parse(reply);
            return libs.Promise.resolve(userFromCache);
        }

        let tmp = authenticationCredential.split("g");
        if (tmp.length != 3) {
            return libs.Promise.reject(new Error("invalid authentication credential"));
        }

        let milliseconds = parseInt(tmp[1], 16);
        let userId = parseInt(tmp[2], 16);
        let now = new Date().getTime();

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