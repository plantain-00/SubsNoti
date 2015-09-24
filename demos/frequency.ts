import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

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