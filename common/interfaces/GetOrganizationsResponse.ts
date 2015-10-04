import * as enums from "../enums";
import * as interfaces from "../interfaces";

export interface GetOrganizationsResponse {
    organizations:{
        id:number;
        name:string;
    }[];
}