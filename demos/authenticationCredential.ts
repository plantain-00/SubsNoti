import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

let salt = libs.generateUuid();
console.log(salt);
let credential = services.authenticationCredential.create(123, salt);
console.log(credential);