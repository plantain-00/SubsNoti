'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let salt = libs.generateUuid();
console.log(salt);
let credential = services.authenticationCredential.create(123, salt);
console.log(credential);
