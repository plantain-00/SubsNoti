import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

services.mongo.connect();
services.mongo.Log.find({}, (error, logs) => {
    if (error) {
        console.log(error);
        return;
    }

    console.log(logs);
});