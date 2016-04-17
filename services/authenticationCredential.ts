import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function create(userId: string, salt: string): string {
    const milliseconds = new Date().getTime();
    return `${libs.md5(salt + milliseconds + userId)}g${milliseconds.toString(16)}g${userId}`;
}

/**
 * identify current user.
 */
export async function authenticateHeader(request: libs.Request): Promise<void> {
    const authorization = request.header(settings.headerNames.authorization);
    if (typeof authorization === "string"
        && authorization.length > settings.authorizationHeaders.token.length
        && authorization.startsWith(settings.authorizationHeaders.token)) {
        const token = authorization.substring(settings.authorizationHeaders.token.length);
        const accessToken = await services.mongo.AccessToken.findOne({ value: token })
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
    const userId = await authenticateCookie(request.cookies[settings.cookieKeys.authenticationCredential]);
    request.userId = userId;
}

/**
 * identify current user.
 */
export async function authenticateCookie(cookie: string): Promise<libs.ObjectId> {
    if (typeof cookie !== "string") {
        return null;
    }

    const authenticationCredential = cookie.trim();

    // may be it is already in cache.
    const reply = await services.redis.get(settings.cacheKeys.user + authenticationCredential);
    if (reply) {
        return new libs.ObjectId(reply);
    }

    const tmp = authenticationCredential.split("g");
    if (tmp.length !== 3) {
        return null;
    }

    const milliseconds = parseInt(tmp[1], 16);
    const userId = tmp[2];
    const id = new libs.ObjectId(userId);
    const now = new Date().getTime();

    // should not expire.
    if (now < milliseconds
        || now > milliseconds + 1000 * 60 * 60 * 24 * 30) {
        return null;
    }

    // should be a valid user.
    const user = await services.mongo.User.findOne({ _id: id })
        .select("salt")
        .exec();
    if (!user) {
        return null;
    }

    // should be verified.
    if (libs.md5(user.salt + milliseconds + userId) === tmp[0]) {
        services.redis.set(settings.cacheKeys.user + authenticationCredential, userId, 8 * 60 * 60);

        return id;
    } else {
        return null;
    }
}
