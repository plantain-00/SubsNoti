import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

services.mongo.connectAsync().then(logs=> {
    logs.find({}).toArray((error, docs) => {
        if (error) {
            console.log(error);
            return;
        }

        console.log(docs);
    });
}, error=> {
    console.log(error);
});