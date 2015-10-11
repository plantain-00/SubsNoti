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

    let emailHead: string = request.body.emailHead;
    let emailTail: string = request.body.emailTail;
    let name = request.body.name;

    if (!emailHead || !emailTail) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    emailHead = emailHead.toLowerCase();
    emailTail = emailTail.toLowerCase();

    try {
        let user = await services.user.getByEmail(emailHead, emailTail);
        if (user) {
            await sendEmail(user.id, user.salt, services.user.getEmail(user));
            services.response.sendCreatedOrModified(response, documentUrl);
        }
        else {
            let salt = libs.generateUuid();
            let rows = await services.db.insertAsync("insert into users (EmailHead,EmailTail,Name,Salt,Status) values(?,?,?,?,?)", [emailHead, emailTail, name, salt, enums.UserStatus.normal]);
            let id = rows.insertId;
            await sendEmail(id, salt, `${emailHead}@${emailTail}`);
            services.logger.log(documentOfCreate.url, request);
            services.response.sendCreatedOrModified(response, documentUrl);
        }
    }
    catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

async function sendEmail(userId: number, salt: string, email: string): Promise<void> {
    await services.frequency.limit(email, 60 * 60);

    let token = services.authenticationCredential.create(userId, salt);
    let url = `http://${settings.config.website.outerHostName}:${settings.config.website.port}${settings.config.urls.login}?authentication_credential=${token}`;

    return services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}
