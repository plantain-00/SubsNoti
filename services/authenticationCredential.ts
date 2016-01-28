import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function create(userId: string, salt: string): string {
    let milliseconds = new Date().getTime();
    return `${libs.md5(salt + milliseconds + userId)}g${milliseconds.toString(16)}g${userId}`;
}

/**
 * identify current user.
 */
export async function authenticateHeader(request: libs.Request): Promise<void> {
    let authorization = libs.validator.trim(request.header(settings.headerNames.authorization));
    if (authorization && authorization.length > settings.authorizationHeaders.token.length && authorization.startsWith(settings.authorizationHeaders.token)) {
        let token = authorization.substring(settings.authorizationHeaders.token.length);
        let accessToken = await services.mongo.AccessToken.findOne({ value: token })
            .exec();
        if (accessToken) {
            request.scopes = accessToken.scopes;
            request.application = accessToken.application as libs.ObjectId;
            request.userId = accessToken.creator as libs.ObjectId;

            accessToken.lastUsed = new Date();
            accessToken.save();
        }
    }
}
/**
 * identify current user.
 */
export async function authenticate(request: libs.Request): Promise<void> {
    let userId = await authenticateCookie(request.cookies[settings.cookieKeys.authenticationCredential]);
    request.userId = userId;
}

/**
 * identify current user.
 */
export async function authenticateCookie(cookie: string): Promise<libs.ObjectId> {
    let authenticationCredential = libs.validator.trim(cookie);
    if (!authenticationCredential) {
        return null;
    }

    // may be it is already in cache.
    let reply = await services.cache.getAsync(settings.cacheKeys.user + authenticationCredential);
    if (reply) {
        return new libs.ObjectId(reply);
    }

    let tmp = authenticationCredential.split("g");
    if (tmp.length !== 3) {
        return null;
    }

    let milliseconds = parseInt(tmp[1], 16);
    let userId = tmp[2];
    let id = new libs.ObjectId(userId);
    let now = new Date().getTime();

    // should not expire.
    if (now < milliseconds
        || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
        return null;
    }

    // should be a valid user.
    let user = await services.mongo.User.findOne({ _id: id })
        .select("salt")
        .exec();
    if (!user) {
        return null;
    }

    // should be verified.
    if (libs.md5(user.salt + milliseconds + userId) === tmp[0]) {
        services.cache.set(settings.cacheKeys.user + authenticationCredential, userId, 8 * 60 * 60);

        return id;
    } else {
        return null;
    }
}
