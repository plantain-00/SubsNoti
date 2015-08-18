import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import services = require("../services/services");

class User {
    id:number;
    name:string;
    emailHead:string;
    emailTail:string;
    organizationId:number;
    status:enums.UserStatus;
}

export = User;