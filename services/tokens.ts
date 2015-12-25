import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export async function create(email: string, url: string, request: libs.Request, name: string): Promise<string> {
    if (!libs.validator.isEmail(email)) {
        return Promise.reject<string>(services.error.fromParameterIsInvalidMessage("email"));
    }

    email = libs.validator.trim(email).toLowerCase();

    // find out if the email is someone's. if no, create an account.
    let user = await services.mongo.User.findOne({ email: email })
        .exec();
    if (!user) {
        let salt = libs.generateUuid();
        user = await services.mongo.User.create({
            email: email,
            name: name,
            salt: salt,
            status: types.UserStatus.normal,
        });
        await services.avatar.createIfNotExistsAsync(user._id.toHexString());

        services.logger.log(url, request);
    }

    await services.frequency.limitEmail(email);

    let token = services.authenticationCredential.create(user._id.toHexString(), user.salt);

    return Promise.resolve(token);
}
