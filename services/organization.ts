import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export function existsByName(name: string): libs.Promise<boolean> {
    return services.db.accessAsync("select * from organizations where Name = ?", [name]).then<boolean>(rows=> rows.length > 0);
}

export function getByCreatorId(creatorId: number): libs.Promise<number[]> {
    return services.db.accessAsync("select * from organization_members where MemberID = ? and IsAdministratorOf = 1", [creatorId]).then(rows=> {
        const organizationIds = libs._.map(rows, (row: any) => row.OrganizationID);
        return libs.Promise.resolve(organizationIds);
    });
}

export const maxNumberUserCanCreate = 3;

export function getByMemberId(memberId: number): libs.Promise<interfaces.Organization[]> {
    return services.db.accessAsync("select o.* from organization_members om left join organizations o on om.OrganizationID = o.ID where MemberID = ?", [memberId]).then(rows=> {
        const organizations = libs._.map(rows, (row: any) => getFromRow(row));
        return libs.Promise.resolve(organizations);
    });
}

export function getFromRow(row: any): interfaces.Organization {
    return {
        id: row.ID,
        name: row.Name,
        status: row.Status,
        creatorId: row.CreatorID
    }
}