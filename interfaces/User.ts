import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

interface User {
    id:number;
    name:string;
    emailHead:string;
    emailTail:string;
    organizationId:number;
    salt:string;
    status:enums.UserStatus;
}

export = User;