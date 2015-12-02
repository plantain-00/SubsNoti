"use strict";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";

settings.currentEnvironment = types.environment.test;

import * as services from "../services";

let apiUrl = settings.getApi();

export const enum CaseName {
    getVersion,
    loginAndLogout,
}

let seeds = require("./seeds.json");

export async function run(operate: (caseName: CaseName, body: string) => Promise<void>) {
    let versionResponse = await services.request.request({ url: apiUrl + "/api/version" });
    await operate(CaseName.getVersion, versionResponse.body);

    let headers = {
        "X-Version": versionResponse.body["version"]
    };

    services.mongo.connect();
    services.mongo.User.remove({});
    libs.mongoose.disconnect();

    let guid = libs.generateUuid();

    let captchaResponse = await services.request.request({
        url: apiUrl + "/api/captchas",
        headers: headers,
        method: "post",
        form: {
            id: guid
        },
    });
    console.log(captchaResponse.body);

    let tokenResponse = await services.request.request({
        url: apiUrl + "/api/tokens",
        headers: headers,
        method: "post",
        form: {
            email: seeds.email,
            name: seeds.name,
            guid: guid,
            code: captchaResponse.body["code"],
        },
    });
    console.log(tokenResponse.body);

    let jar = libs.request.jar();
    let loginResponse = await services.request.request({
        url: tokenResponse.body["url"],
        headers: headers,
        jar: jar,
    }, "html");

    let logoutResponse = await services.request.request({
        url: apiUrl + "/api/user/logged_in",
        headers: headers,
        method: "delete",
        jar: jar,
    });
    await operate(CaseName.loginAndLogout, logoutResponse.body);
}
