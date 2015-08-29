import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

services.cache.set("key2", {
    a: "abc",
    b: 123
}, 10);

services.cache.get("key2", "b", (error, reply)=> {
    if (error) {
        console.log(error);
        return;
    }

    console.log(reply);
});