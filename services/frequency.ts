import * as types from "../share/types";
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
    if (settings.currentEnvironment === types.environment.test) {
        return;
    }
    const frequencyKey = keyPrefix + key;
    const value = await services.cache.get(frequencyKey);

    if (value) {
        const reply = await services.cache.ttl(frequencyKey);

        return Promise.reject(services.error.fromMessage(`do it later after ${reply} seconds`, types.StatusCode.tooManyRequest));
    }

    services.cache.set(frequencyKey, "1", seconds);
}
