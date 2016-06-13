import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export async function create(email: string, url: string, request: libs.Request, name: string): Promise<string> {
    if (!libs.validator.isEmail(email)) {
        return Promise.reject<string>(libs.util.format(services.error.parameterIsInvalid, "email"));
    }

    email = libs.validator.trim(email).toLowerCase();

    // find out if the email is someone's. if no, create an account.
    let user = await services.mongo.User.findOne({ email })
        .exec();
    if (!user) {
        const salt = services.utils.generateUuid();
        user = await services.mongo.User.create({
            email,
            name,
            salt,
            status: types.UserStatus.normal,
        });
        await services.avatar.createIfNotExistsAsync(user._id.toHexString());

        services.logger.logRequest(url, request);
    }

    await services.frequency.limitEmail(email);

    const token = services.authenticationCredential.create(user._id.toHexString(), user.salt);

    return token;
}
