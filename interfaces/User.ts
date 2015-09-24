import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "./interfaces";

export interface User {
    id:number;
    name:string;
    emailHead:string;
    emailTail:string;
    salt:string;
    status:enums.UserStatus;

    createdOrganizationIds?:number[];
}