"use strict";
const types = require("../share/types");
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
let pool;
function connect() {
    pool = libs.mysql.createPool(settings.db);
}
exports.connect = connect;
function getConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) {
                reject(services.error.fromError(error, 500 /* internalServerError */));
            }
            else {
                resolve(connection);
            }
        });
    });
}
function accessAsync(sql, parameters) {
    return getConnection().then(connection => {
        return new Promise((resolve, reject) => {
            connection.query(sql, parameters, (error, rows) => {
                connection.release();
                if (error) {
                    reject(services.error.fromError(error, 500 /* internalServerError */));
                }
                else {
                    resolve(rows);
                }
            });
        });
    });
}
exports.queryAsync = accessAsync;
exports.insertAsync = accessAsync;
function beginTransactionAsync() {
    return getConnection().then(connection => {
        return new Promise((resolve, reject) => {
            connection.beginTransaction(error => {
                if (error) {
                    connection.release();
                    reject(services.error.fromError(error, 500 /* internalServerError */));
                }
                else {
                    resolve(connection);
                }
            });
        });
    });
}
exports.beginTransactionAsync = beginTransactionAsync;
function accessInTransactionAsync(connection, sql, parameters) {
    return new Promise((resolve, reject) => {
        connection.query(sql, parameters, (error, rows) => {
            if (error) {
                reject(services.error.fromError(error, 500 /* internalServerError */));
            }
            else {
                resolve(rows);
            }
        });
    }).catch(error => {
        return rollbackAsync(connection).then(() => {
            return Promise.reject(error);
        });
    });
}
exports.queryInTransactionAsync = accessInTransactionAsync;
exports.insertInTransactionAsync = accessInTransactionAsync;
function rollbackAsync(connection) {
    return new Promise((resolve, reject) => {
        connection.rollback(() => {
            connection.release();
            resolve();
        });
    });
}
exports.rollbackAsync = rollbackAsync;
function endTransactionAsync(connection) {
    return new Promise((resolve, reject) => {
        connection.commit(error => {
            if (error) {
                reject(services.error.fromError(error, 500 /* internalServerError */));
            }
            else {
                connection.release();
                resolve();
            }
        });
    }).catch(error => {
        return rollbackAsync(connection).then(() => {
            return Promise.reject(error);
        });
    });
}
exports.endTransactionAsync = endTransactionAsync;
