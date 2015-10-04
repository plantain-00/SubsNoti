import * as enums from "../enums";
import * as interfaces from "../interfaces";

export interface GetThemesResponse {
    themes:{
        id: number;
        title: string;
        detail: string;
        organizationId: number;
        createTime: number;
    }[];
}