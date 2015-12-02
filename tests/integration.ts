"use strict";

import * as faker from "faker";

import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";

settings.currentEnvironment = types.environment.test;

import * as services from "../services";

let apiUrl = settings.getApi();

export const enum CaseName {
    getVersion
}

export async function run(operate: (caseName: CaseName, response: any) => Promise<void>) {
    let versionResponse = await services.request.getAsync<types.Response>(apiUrl + "/api/version", "json");
    await operate(CaseName.getVersion, versionResponse.body);
}
