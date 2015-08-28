import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

import assert = require("assert");

describe('getAuthenticationCredential', ()=> {
    it('should work', () => {
        assert.equal(services.cacheKeyRule.getAuthenticationCredential("abc"), "user_abc");
    });
});

describe('getFrequency', ()=> {
    it('should work', () => {
        assert.equal(services.cacheKeyRule.getFrequency("abc"), "frequency_abc");
    });
});
