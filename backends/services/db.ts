'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let pool = libs.mysql.createPool(settings.config.db);

function access(sql: string, parameters: any[], next: (error: interfaces.E, rows: any) => void) {
    pool.getConnection((error, connection) => {
        if (error) {
            next(services.error.fromError(error, enums.StatusCode.internalServerError), null);
            return;
        }

        connection.query(sql, parameters, (error, rows) => {
            if (error) {
                connection.release();
                next(services.error.fromError(error, enums.StatusCode.internalServerError), null);
                return;
            }

            connection.release();
            next(null, rows);
        });
    });
}

export let queryAsync = services.promise.promisify3<string, any[], any[]>(access);

export let insertAsync = services.promise.promisify3<string, any[], { insertId: number }>(access);

function beginTransaction(next: (error: interfaces.E, connection: libs.MysqlConnection) => void): void {
    pool.getConnection((error, connection) => {
        if (error) {
            next(services.error.fromError(error, enums.StatusCode.internalServerError), null);
            return;
        }

        connection.beginTransaction(error=> {
            if (error) {
                connection.release();
                next(services.error.fromError(error, enums.StatusCode.internalServerError), null);
                return;
            }

            next(null, connection);
        });
    });
}

export let beginTransactionAsync = services.promise.promisify1<libs.MysqlConnection>(beginTransaction);

function accessInTransaction(connection: libs.MysqlConnection, sql: string, parameters: any[], next: (error: interfaces.E, rows: any) => void) {
    connection.query(sql, parameters, (error, rows) => {
        if (error) {
            rollback(connection, () => {
                next(services.error.fromError(error, enums.StatusCode.internalServerError), null);
            });
            return;
        }

        next(null, rows);
    });
}

export let queryInTransactionAsync = services.promise.promisify4<libs.MysqlConnection, string, any[], any[]>(accessInTransaction);

export let insertInTransactionAsync = services.promise.promisify4<libs.MysqlConnection, string, any[], { insertId: number }>(accessInTransaction);

function rollback(connection: libs.MysqlConnection, next: () => void): void {
    connection.rollback(() => {
        connection.release();
        next();
    });
}

export let rollbackAsync = services.promise.promisify2<libs.MysqlConnection, void>(rollback);

function endTransaction(connection: libs.MysqlConnection, next: (error: interfaces.E) => void): void {
    connection.commit(error=> {
        if (error) {
            rollback(connection, () => {
                next(services.error.fromError(error, enums.StatusCode.internalServerError));
            });
            return;
        }

        connection.release();
        next(null);
    });
}

export let endTransactionAsync = services.promise.promisify2<libs.MysqlConnection, void>(endTransaction);
