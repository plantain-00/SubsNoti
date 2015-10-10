'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

interface Organization {
    id: number;
    name: string;
    status: enums.OrganizationStatus;
    creatorId: number;
}

export async function existsByName(name: string): Promise<boolean> {
    let rows = await services.db.queryAsync("select * from organizations where Name = ?", [name]);
    return Promise.resolve(rows.length > 0);
}

export async function getByCreatorId(creatorId: number): Promise<number[]> {
    let rows = await services.db.queryAsync("select * from organization_members where MemberID = ? and IsAdministratorOf = 1", [creatorId]);
    let organizationIds = libs._.map(rows, (row: any) => row.OrganizationID);
    return Promise.resolve(organizationIds);
}

export let maxNumberUserCanCreate = 3;

export async function getByMemberId(memberId: number): Promise<Organization[]> {
    let rows = await services.db.queryAsync("select o.* from organization_members om left join organizations o on om.OrganizationID = o.ID where MemberID = ?", [memberId]);
    let organizations = libs._.map(rows, (row: any) => getFromRow(row));
    return Promise.resolve(organizations);
}

export function getFromRow(row: any): Organization {
    return {
        id: row.ID,
        name: row.Name,
        status: row.Status,
        creatorId: row.CreatorID
    }
}
