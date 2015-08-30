import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export function getById(id:number, next:(error:Error, user:interfaces.User)=>void) {
    if (typeof id != "number") {
        next(null, null);
        return;
    }

    services.db.access("select * from users where ID = ?", [id], (error, rows)=> {
        if (error) {
            next(error, null);
            return;
        }

        if (rows.length == 0) {
            next(null, null);
            return;
        }

        next(null, getFromRow(rows[0]));
    });
}

export function getFromRow(row:any):interfaces.User {
    return {
        id: row.ID,
        name: row.Name,
        emailHead: row.EmailHead,
        emailTail: row.EmailTail,
        organizationId: row.OrganizationID,
        salt: row.Salt,
        status: row.Status
    }
}

export function getEmail(user:interfaces.User):string {
    return `${user.emailHead}@${user.emailTail}`;
}