import * as enums from "../enums";

export interface Theme {
    id: number;
    title: string;
    detail: string;
    organizationId: number;
    status: enums.ThemeStatus;
    createTime: Date;
    creator: {
        id: number,
        name: string,
        email: string
    }
}