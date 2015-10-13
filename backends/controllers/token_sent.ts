'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let documentOfCreate = {
    url: "/api/token_sent",
    method: "post",
    documentUrl: "/doc/api/Send token via email.html"
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    if (services.contentType.isInvalid(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    let email: string = request.body.email;
    let name = request.body.name;

    if (!email) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    email = email.toLowerCase();

    try {
        let user = await services.mongo.User.findOne({ email: email }).exec();
        if (user) {
            await sendEmail(user._id, user.salt, email);
            services.response.sendCreatedOrModified(response, documentUrl);
        }
        else {
            let salt = libs.generateUuid();
            user = await services.mongo.User.create({
                email: email,
                name: name,
                salt: salt,
                status: enums.UserStatus.normal
            });
            await sendEmail(user._id, salt, email);
            services.logger.log(documentOfCreate.url, request);
            services.response.sendCreatedOrModified(response, documentUrl);
        }
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

async function sendEmail(userId: libs.mongoose.Types.ObjectId, salt: string, email: string): Promise<void> {
    await services.frequency.limit(email, 60 * 60);

    let token = services.authenticationCredential.create(userId.toHexString(), salt);
    let url = `http://${settings.config.website.outerHostName}:${settings.config.website.port}${settings.config.urls.login}?authentication_credential=${token}`;

    return services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}
