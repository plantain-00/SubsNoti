import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function existsByName(name:string, next:(error:Error, exists:boolean)=>void) {
    services.db.access("select * from organizations where Name = ?", [name], (error, rows)=> {
        if (error) {
            next(error, null);
            return;
        }

        next(null, rows.length > 0);
    });
}

export function getByCreatorId(creatorId:number, next:(error:Error, organizationIds:number[])=>void) {
    services.db.access("select * from organization_members where MemberID = ? and IsAdministratorOf = 1", [creatorId], (error, rows)=> {
        if (error) {
            next(error, null);
            return;
        }

        const organizationIds = libs._.map(rows, (row:any)=>row.OrganizationID);
        next(null, organizationIds);
    });
}

export function getFromRow(row:any):interfaces.Organization {
    return {
        id: row.ID,
        name: row.Name,
        status: row.Status,
        createdBy: row.CreatedBy
    }
}