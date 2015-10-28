'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export let documentOfCreate = {
    url: "/api/token_sent",
    method: "post",
    documentUrl: "/doc/api/Send token via email.html"
};

export async function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    if (!libs.validator.isEmail(request.body.email)) {
        services.response.sendError(response, services.error.fromParameterIsInvalidMessage("email"), documentUrl);
        return;
    }

    let email = libs.validator.trim(request.body.email).toLowerCase();
    let name = libs.validator.trim(request.body.name);

    try {
        // validate captcha code if v>=0.3 or after 2015-11-01.
        if (libs.semver.satisfies(request.v, ">=0.3") || libs.moment().isAfter(libs.moment("2015-11-01", "YYYY-MM-DD"))) {
            let code = libs.validator.trim(request.body.code);
            let guid = libs.validator.trim(request.body.guid);
            if (code === '' || guid === '') {
                services.response.sendError(response, services.error.fromParameterIsInvalidMessage("code or guid"), documentUrl);
                return;
            }

            await services.captcha.validate(guid, code);
        }

        // find out if the email is someone's. if no, create an account.
        let user = await services.mongo.User.findOne({ email: email })
            .select("_id salt email")
            .exec();
        if (!user) {
            let salt = libs.generateUuid();
            user = await services.mongo.User.create({
                email: email,
                name: name,
                salt: salt,
                status: enums.UserStatus.normal
            });
            await services.avatar.createIfNotExistsAsync(user._id.toHexString());

            services.logger.log(documentOfCreate.url, request);
        }

        await services.frequency.limitEmail(email, 60 * 60);

        let token = services.authenticationCredential.create(user._id.toHexString(), user.salt);
        let url = `http://${settings.config.website.outerHostName}:${settings.config.website.port}${settings.config.urls.login}?authentication_credential=${token}&v=0.01`;

        await services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);

        services.response.sendSuccess(response, enums.StatusCode.createdOrModified);
    }
    catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
