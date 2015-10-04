import * as enums from "../enums";
import * as interfaces from "../interfaces";

export interface User {
    id:number;
    name:string;
    emailHead:string;
    emailTail:string;
    salt:string;
    status:enums.UserStatus;

    createdOrganizationIds?:number[];
}