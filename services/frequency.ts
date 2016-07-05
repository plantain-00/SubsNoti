import * as types from "../share/types";
import * as services from "../services";

/**
 * make sure operation of `send email` does not reach the limit.
 */
export async function limitEmail(key: string): Promise<void> {
    return limit(key, services.settings.rateLimit.sendEmail, services.settings.cacheKeys.rateLimit.sendEmail);
}

/**
 * make sure operation of `get captcha` does not reach the limit.
 */
export async function limitCaptcha(key: string): Promise<void> {
    return limit(key, services.settings.rateLimit.userCaptcha, services.settings.cacheKeys.rateLimit.userCaptcha);
}

async function limit(key: string, seconds: number, keyPrefix: string): Promise<void> {
    if (services.settings.currentEnvironment === types.environment.test) {
        return;
    }
    const frequencyKey = keyPrefix + key;
    const value = await services.redis.get(frequencyKey);

    if (value) {
        const reply = await services.redis.ttl(frequencyKey);

        return Promise.reject(`do it later after ${reply} seconds`);
    }

    services.redis.set(frequencyKey, "1", seconds);
}
