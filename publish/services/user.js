var models = require("../models/models");
var services = require("../services/services");
function getById(id, next) {
    if (typeof id != "number") {
        next(null, null);
        return;
    }
    services.db.access("select * from Users where ID = ?", [id], function (error, rows) {
        if (error) {
            next(error, null);
            return;
        }
        if (rows.length == 0) {
            next(null, null);
            return;
        }
        next(null, new models.User(rows[0]));
    });
}
exports.getById = getById;
//# sourceMappingURL=user.js.map