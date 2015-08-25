import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

services.frequency.limit("test", 2, error=> {
    if (error) {
        console.log(error);
        return;
    }

    services.frequency.limit("test", 2, error=> {
        if (error) {
            console.log(error);
            return;
        }

        console.log(true);
    });
});