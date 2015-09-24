import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

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

export function getByEmail(emailHead:string, emailTail:string, next:(error:Error, user:interfaces.User)=>void) {
    services.db.access("select * from users where EmailHead = ? and EmailTail = ?", [emailHead, emailTail], (error, rows)=> {
        if (error) {
            next(error, null);
            return;
        }

        if (rows.length == 0) {
            next(null, null);
            return;
        }

        if (rows.length > 1) {
            next(new Error("the account is in wrong status now"), null);
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
        salt: row.Salt,
        status: row.Status
    }
}

export function getEmail(user:interfaces.User):string {
    return `${user.emailHead}@${user.emailTail}`;
}