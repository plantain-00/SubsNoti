import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

var salt = libs.generateUuid();
console.log(salt);
var credential = services.authenticationCredential.create(123, salt);
console.log(credential);