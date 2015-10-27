'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

/**
 * make sure operation of `send email` does not reach the limit.
 */
export async function limitEmail(key: string, seconds: number): Promise<void> {
    return limit(key, seconds, settings.config.cacheKeys.emailFrequency);
}

/**
 * make sure operation of `get captcha` does not reach the limit.
 */
export async function limitCaptcha(key: string, seconds: number): Promise<void> {
    return limit(key, seconds, settings.config.cacheKeys.userCaptchaFrequency);
}

async function limit(key: string, seconds: number, keyPrefix: string): Promise<void> {
    let frequencyKey = keyPrefix + key;
    let value = await services.cache.getStringAsync(frequencyKey);

    if (value) {
        let reply = await services.cache.ttlAsync(frequencyKey);

        return Promise.reject(new Error(`do it later after ${reply} seconds`));
    }

    services.cache.setString(keyPrefix + key, key, seconds);
    return Promise.resolve();
}
