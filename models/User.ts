import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

class User {
    id:number;
    name:string;
    emailHead:string;
    emailTail:string;
    organizationId:number;
    salt:string;
    status:enums.UserStatus;

    constructor(row:any) {
        this.id = row.ID;
        this.name = row.Name;
        this.emailHead = row.EmailHead;
        this.emailTail = row.EmailTail;
        this.organizationId = row.OrganizationID;
        this.salt = row.Salt;
        this.status = row.Status;
    }
}

export = User;