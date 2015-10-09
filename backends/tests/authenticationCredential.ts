'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

describe('create', ()=> {
    it('should work', () => {
        let salt = libs.generateUuid();
        services.authenticationCredential.create(123, salt);
    });
});