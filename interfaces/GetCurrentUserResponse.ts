import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("./interfaces");

interface GetCurrentUserResponse {
    email: string;
    name: string;
    canCreateOrganization: boolean;
}

export = GetCurrentUserResponse;