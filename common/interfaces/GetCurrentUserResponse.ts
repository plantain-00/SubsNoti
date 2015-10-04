import * as enums from "../enums";
import * as interfaces from "../interfaces";

export interface GetCurrentUserResponse {
    email: string;
    name: string;
    canCreateOrganization: boolean;
}