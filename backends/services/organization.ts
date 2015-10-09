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

export function existsByName(name: string): Promise<boolean> {
    return services.db.accessAsync("select * from organizations where Name = ?", [name]).then<boolean>(rows=> rows.length > 0);
}

export function getByCreatorId(creatorId: number): Promise<number[]> {
    return services.db.accessAsync("select * from organization_members where MemberID = ? and IsAdministratorOf = 1", [creatorId]).then(rows=> {
        let organizationIds = libs._.map(rows, (row: any) => row.OrganizationID);
        return Promise.resolve(organizationIds);
    });
}

export let maxNumberUserCanCreate = 3;

export function getByMemberId(memberId: number): Promise<Organization[]> {
    return services.db.accessAsync("select o.* from organization_members om left join organizations o on om.OrganizationID = o.ID where MemberID = ?", [memberId]).then(rows=> {
        let organizations = libs._.map(rows, (row: any) => getFromRow(row));
        return Promise.resolve(organizations);
    });
}

export function getFromRow(row: any): Organization {
    return {
        id: row.ID,
        name: row.Name,
        status: row.Status,
        creatorId: row.CreatorID
    }
}