import * as enums from "../enums";
import * as interfaces from "../interfaces";

export interface Organization {
    id:number;
    name:string;
    status:enums.OrganizationStatus;
    creatorId:number;
}