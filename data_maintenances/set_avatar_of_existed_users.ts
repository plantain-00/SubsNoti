import * as libs from "../libs";
import * as services from "../services";

services.mongo.connect();

(async () => {
    try {
        const users = await services.mongo.User.find({}).exec();
        for (const user of users) {
            await services.avatar.createIfNotExistsAsync(user._id.toHexString());
        }
    } catch (error) {
        services.logger.logError(error);
    }

    libs.mongoose.disconnect();
})();
