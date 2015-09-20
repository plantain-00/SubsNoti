import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function getInOrganizationId(organizationId:number, next:(error:Error, themes:interfaces.Theme[])=>void) {
    services.db.access("select * from themes where OrganizationID = ?", [organizationId], (error, rows)=> {
        if (error) {
            next(error, null);
            return;
        }

        next(null, libs._.map(rows, (row:any)=>getFromRow(row)));
    });
}

export function getFromRow(row:any):interfaces.Theme {
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