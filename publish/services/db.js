var libs = require("../libs");
var settings = require("../settings");
var pool = libs.mysql.createPool(settings.config.db);
function access(sql, parameters, next) {
    pool.getConnection(function (error, connection) {
        if (error) {
            next(error, null);
            return;
        }
        connection.query(sql, parameters, function (error, rows) {
            if (error) {
                connection.release();
                next(error, null);
                return;
            }
            connection.release();
            next(null, rows);
        });
    });
}
exports.access = access;
function beginTransaction(next) {
    pool.getConnection(function (error, connection) {
        if (error) {
            next(error, null);
            return;
        }
        connection.beginTransaction(function (error) {
            if (error) {
                connection.release();
                next(error, null);
                return;
            }
            next(null, connection);
        });
    });
}
exports.beginTransaction = beginTransaction;
function accessInTransaction(connection, sql, parameters, next) {
    connection.query(sql, parameters, function (error, rows) {
        if (error) {
            rollback(connection, function () {
                next(error, null);
            });
            return;
        }
        next(null, rows);
    });
}
exports.accessInTransaction = accessInTransaction;
function rollback(connection, next) {
    connection.rollback(function () {
        connection.release();
        next();
    });
}
exports.rollback = rollback;
function endTransaction(connection, next) {
    connection.commit(function (error) {
        if (error) {
            rollback(connection, function () {
                next(error);
            });
            return;
        }
        connection.release();
        next(null);
    });
}
exports.endTransaction = endTransaction;
//# sourceMappingURL=db.js.map