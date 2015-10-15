'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

services.mongo.connect();

//services.mongo.Organization.remove({}).exec();
//services.mongo.Theme.remove({}).exec();
//services.mongo.User.remove({}).exec();

services.mongo.User.find({}, (error, users) => {
    if (error) {
        console.log(error);
        return;
    }

    console.log(users);
});

services.mongo.Organization.find({}, (error, organizations) => {
    if (error) {
        console.log(error);
        return;
    }

    console.log(organizations);
});

services.mongo.Theme.find({}, (error, themes) => {
    if (error) {
        console.log(error);
        return;
    }

    console.log(themes);
});