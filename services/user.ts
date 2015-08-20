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

    services.db.access("select * from Users where ID = ?", [id], (error, rows)=> {
        if (error) {
            next(error, null);
            return;
        }

        if (rows.length == 0) {
            next(null, null);
            return;
        }

        next(null, new interfaces.User(rows[0]));
    });
}