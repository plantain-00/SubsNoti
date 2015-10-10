'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

describe('getAuthenticationCredential', ()=> {
    it('should work', () => {
        libs.assert.equal(services.cacheKeyRule.getAuthenticationCredential("abc"), "user_abc");
    });
});

describe('getFrequency', ()=> {
    it('should work', () => {
        libs.assert.equal(services.cacheKeyRule.getFrequency("abc"), "frequency_abc");
    });
});
