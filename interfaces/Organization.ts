import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "./interfaces";

export interface Organization {
    id:number;
    name:string;
    status:enums.OrganizationStatus;
    creatorId:number;
}