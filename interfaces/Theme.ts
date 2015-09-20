import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

interface Theme {
    id:number;
    title:string;
    detail:string;
    organizationId:number;
    status:enums.ThemeStatus;
    creatorId:number;
    createTime:Date;
}

export = Theme;