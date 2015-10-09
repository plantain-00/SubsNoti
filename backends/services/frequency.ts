'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export async function limit(key: string, seconds: number): Promise<void> {
    let frequencyKey = services.cacheKeyRule.getFrequency(key);
    let value = await services.cache.getStringAsync(frequencyKey);

    if (value) {
        return services.cache.ttlAsync(frequencyKey).then(reply=> {
            return Promise.reject(new Error(`do it later after ${reply} seconds`));
        });
    }

    services.cache.setString(services.cacheKeyRule.getFrequency(key), key, seconds);
    return Promise.resolve();
}