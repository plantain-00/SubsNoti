import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

interface Organization {
    id:number;
    name:string;
    status:enums.OrganizationStatus;
    creatorId:number;
}

export = Organization;