import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function create(userId: number, salt: string): string {
    let milliseconds = new Date().getTime();
    return `${libs.md5(salt + milliseconds + userId) }g${milliseconds.toString(16) }g${userId.toString(16) }`;
}