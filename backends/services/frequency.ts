import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function limit(key: string, seconds: number): libs.Promise<void> {
    let frequencyKey = services.cacheKeyRule.getFrequency(key);
    return services.cache.getStringAsync(frequencyKey).then(value=> {
        if (value) {
            return services.cache.ttlAsync(frequencyKey).then(reply=> {
                return libs.Promise.reject(new Error(`do it later after ${reply} seconds`));
            });
        }

        services.cache.setString(services.cacheKeyRule.getFrequency(key), key, seconds);
        return libs.Promise.resolve();
    });
}