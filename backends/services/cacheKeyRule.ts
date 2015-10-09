'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function getAuthenticationCredential(authenticationCredential: string): string {
    return "user_" + authenticationCredential;
}

export function getFrequency(key: string): string {
    return "frequency_" + key;
}