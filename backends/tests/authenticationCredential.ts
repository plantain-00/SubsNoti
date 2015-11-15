"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

describe("create", () => {
    it("should work", () => {
        let salt = libs.generateUuid();
        services.authenticationCredential.create("123", salt);
    });
});
