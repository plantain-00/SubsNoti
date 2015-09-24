import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export function getAuthenticationCredential(authenticationCredential:string):string {
    return "user_" + authenticationCredential;
}

export function getFrequency(key:string):string {
    return "frequency_" + key;
}