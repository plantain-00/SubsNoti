import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

export function getById(id: number): libs.Promise<interfaces.User> {
    return services.db.accessAsync("select * from users where ID = ?", [id]).then(rows=> {
        if (rows.length == 0) {
            return Promise.resolve<interfaces.User>(null);
        }

        return Promise.resolve(getFromRow(rows[0]));
    });
}

export function getByEmail(emailHead: string, emailTail: string): libs.Promise<interfaces.User> {
    return services.db.accessAsync("select * from users where EmailHead = ? and EmailTail = ?", [emailHead, emailTail]).then(rows=> {
        if (rows.length == 0) {
            return libs.Promise.resolve(null);
        }

        if (rows.length > 1) {
            return libs.Promise.reject(new Error("the account is in wrong status now"));
        }

        return libs.Promise.resolve(getFromRow(rows[0]));
    });
}

export function getFromRow(row: any): interfaces.User {
    return {
        id: row.ID,
        name: row.Name,
        emailHead: row.EmailHead,
        emailTail: row.EmailTail,
        salt: row.Salt,
        status: row.Status
    }
}

export function getEmail(user: interfaces.User): string {
    return `${user.emailHead}@${user.emailTail}`;
}