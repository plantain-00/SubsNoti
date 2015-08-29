import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

services.mongo.connect((error, logs)=> {
    if (error) {
        console.log(error);
        return;
    }

    logs.find({}).toArray((error, docs)=> {
        if (error) {
            console.log(error);
            return;
        }

        console.log(docs);
    });
});