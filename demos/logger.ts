import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

services.mongo.connect();
services.mongo.Logs.find({}, (error, logs) => {
    if (error) {
        console.log(error);
        return;
    }

    console.log(logs);
});