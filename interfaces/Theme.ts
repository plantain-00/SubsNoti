import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "./interfaces";

export interface Theme {
    id:number;
    title:string;
    detail:string;
    organizationId:number;
    status:enums.ThemeStatus;
    creatorId:number;
    createTime:Date;
}