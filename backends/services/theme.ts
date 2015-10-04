import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function getInOrganizationId(organizationId: number): libs.Promise<interfaces.Theme[]> {
    return services.db.accessAsync("select * from themes where OrganizationID = ? order by CreateTime desc", [organizationId]).then(rows=> {
        return libs.Promise.resolve(libs._.map(rows, (row: any) => getFromRow(row)));
    });
}

export function getFromRow(row: any): interfaces.Theme {
    return {
        id: row.ID,
        title: row.Title,
        detail: row.Detail,
        organizationId: row.OrganizationID,
        status: row.Status,
        creatorId: row.CreatorID,
        createTime: new Date(row.CreateTime)
    };
}