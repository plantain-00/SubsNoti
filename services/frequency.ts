"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

/**
 * make sure operation of `send email` does not reach the limit.
 */
export async function limitEmail(key: string): Promise<void> {
    return limit(key, settings.rateLimit.sendEmail, settings.cacheKeys.rateLimit.sendEmail);
}

/**
 * make sure operation of `get captcha` does not reach the limit.
 */
export async function limitCaptcha(key: string): Promise<void> {
    return limit(key, settings.rateLimit.userCaptcha, settings.cacheKeys.rateLimit.userCaptcha);
}

async function limit(key: string, seconds: number, keyPrefix: string): Promise<void> {
    let frequencyKey = keyPrefix + key;
    let value = await services.cache.getStringAsync(frequencyKey);

    if (value) {
        let reply = await services.cache.ttlAsync(frequencyKey);

        return Promise.reject(services.error.fromMessage(`do it later after ${reply} seconds`, types.StatusCode.tooManyRequest));
    }

    services.cache.setString(frequencyKey, "1", seconds);
    return Promise.resolve();
}
