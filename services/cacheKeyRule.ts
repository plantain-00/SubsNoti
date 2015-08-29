import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function getAuthenticationCredential(authenticationCredential:string):string {
    return "user_" + authenticationCredential;
}

export function getFrequency(key:string):string {
    return "frequency_" + key;
}