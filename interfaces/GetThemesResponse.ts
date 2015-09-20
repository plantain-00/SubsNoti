import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

interface GetThemesResponse {
    themes:{
        id: number;
        title: string;
        detail: string;
        organizationId: number;
        createTime: number;
    }[];
}

export = GetThemesResponse;