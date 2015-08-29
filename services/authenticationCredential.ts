import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function create(userId:number, salt:string):string {
    const milliseconds = new Date().getTime();
    return libs.md5(salt + milliseconds + userId) + "g" + milliseconds.toString(16) + "g" + userId.toString(16);
}