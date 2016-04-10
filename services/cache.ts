import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let client: IORedis.Redis;

export function connect() {
    const redis = settings.redis.get(settings.currentEnvironment);
    client = new libs.Redis(redis.port, redis.host, redis.options);
    client.on("error", error => {
        services.logger.logError(error);
    });
}
