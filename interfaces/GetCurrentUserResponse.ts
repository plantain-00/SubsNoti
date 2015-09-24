import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "./interfaces";

export interface GetCurrentUserResponse {
    email: string;
    name: string;
    canCreateOrganization: boolean;
}