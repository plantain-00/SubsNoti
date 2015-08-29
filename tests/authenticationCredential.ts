import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

import assert = require("assert");

describe('create', ()=> {
    it('should work', () => {
        var salt = libs.generateUuid();
        services.authenticationCredential.create(123, salt);
    });
});