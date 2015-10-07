import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

export function getInOrganizationId(organizationId: number): libs.Promise<interfaces.Theme[]> {
    return services.db.accessAsync("select themes.*,users.ID as UserID,users.Name,users.EmailHead,users.EmailTail from themes left join users on themes.CreatorID = users.ID where themes.OrganizationID = ? order by themes.CreateTime desc", [organizationId]).then(rows=> {
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
        createTime: new Date(row.CreateTime),
        creator: {
            id: row.UserID,
            name: row.Name,
            email: `${row.EmailHead}@${row.EmailTail}`
        }
    };
}