import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

describe('create', ()=> {
    it('should work', () => {
        let salt = libs.generateUuid();
        services.authenticationCredential.create(123, salt);
    });
});