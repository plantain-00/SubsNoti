import * as enums from "../enums";

export interface Organization {
    id:number;
    name:string;
    status:enums.OrganizationStatus;
    creatorId:number;
}