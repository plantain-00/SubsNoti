"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let pool = libs.mysql.createPool(settings.config.db);

import MysqlConnection = libs.mysql.IConnection;

function access(sql: string, parameters: any[], next: (error: types.E, rows: any) => void) {
    pool.getConnection((error, connection) => {
        if (error) {
            next(services.error.fromError(error, types.StatusCode.internalServerError), null);
            return;
        }

        connection.query(sql, parameters, (error, rows) => {
            if (error) {
                connection.release();
                next(services.error.fromError(error, types.StatusCode.internalServerError), null);
                return;
            }

            connection.release();
            next(null, rows);
        });
    });
}

export let queryAsync = services.promise.promisify3<string, any[], any[]>(access);

export let insertAsync = services.promise.promisify3<string, any[], { insertId: number }>(access);

function beginTransaction(next: (error: types.E, connection: MysqlConnection) => void): void {
    pool.getConnection((error, connection) => {
        if (error) {
            next(services.error.fromError(error, types.StatusCode.internalServerError), null);
            return;
        }

        connection.beginTransaction(error => {
            if (error) {
                connection.release();
                next(services.error.fromError(error, types.StatusCode.internalServerError), null);
                return;
            }

            next(null, connection);
        });
    });
}

export let beginTransactionAsync = services.promise.promisify1<MysqlConnection>(beginTransaction);

function accessInTransaction(connection: MysqlConnection, sql: string, parameters: any[], next: (error: types.E, rows: any) => void) {
    connection.query(sql, parameters, (error, rows) => {
        if (error) {
            rollback(connection, () => {
                next(services.error.fromError(error, types.StatusCode.internalServerError), null);
            });
            return;
        }

        next(null, rows);
    });
}

export let queryInTransactionAsync = services.promise.promisify4<MysqlConnection, string, any[], any[]>(accessInTransaction);

export let insertInTransactionAsync = services.promise.promisify4<MysqlConnection, string, any[], { insertId: number }>(accessInTransaction);

function rollback(connection: MysqlConnection, next: () => void): void {
    connection.rollback(() => {
        connection.release();
        next();
    });
}

export let rollbackAsync = services.promise.promisify2<MysqlConnection, void>(rollback);

function endTransaction(connection: MysqlConnection, next: (error: types.E) => void): void {
    connection.commit(error => {
        if (error) {
            rollback(connection, () => {
                next(services.error.fromError(error, types.StatusCode.internalServerError));
            });
            return;
        }

        connection.release();
        next(null);
    });
}

export let endTransactionAsync = services.promise.promisify2<MysqlConnection, void>(endTransaction);
