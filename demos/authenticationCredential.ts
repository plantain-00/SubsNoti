import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

const salt = libs.generateUuid();
console.log(salt);
const credential = services.authenticationCredential.create(123, salt);
console.log(credential);