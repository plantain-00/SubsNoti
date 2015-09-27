import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

const pool = libs.mysql.createPool(settings.config.db);

function access(sql: string, parameters: any[], next: (error: Error, rows: any) => void) {
    pool.getConnection((error, connection) => {
        if (error) {
            next(error, null);
            return;
        }

        connection.query(sql, parameters, (error, rows) => {
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

export const accessAsync = libs.Promise.promisify(access);

function beginTransaction(next: (error: Error, connection: libs.MysqlConnection) => void): void {
    pool.getConnection((error, connection) => {
        if (error) {
            next(error, null);
            return;
        }

        connection.beginTransaction(error=> {
            if (error) {
                connection.release();
                next(error, null);
                return;
            }

            next(null, connection);
        });
    });
}

export const beginTransactionAsync = libs.Promise.promisify(beginTransaction);

export const accessInTransactionAsync = libs.Promise.promisify(accessInTransaction);

function accessInTransaction(connection: libs.MysqlConnection, sql: string, parameters: any[], next: (error: Error, rows: any) => void) {
    connection.query(sql, parameters, (error, rows) => {
        if (error) {
            rollback(connection, () => {
                next(error, null);
            });
            return;
        }

        next(null, rows);
    });
}

function rollback(connection: libs.MysqlConnection, next: () => void): void {
    connection.rollback(() => {
        connection.release();
        next();
    });
}

export const rollbackAsync = libs.Promise.promisify(rollback);

function endTransaction(connection: libs.MysqlConnection, next: (error: Error) => void): void {
    connection.commit(error=> {
        if (error) {
            rollback(connection, () => {
                next(error);
            });
            return;
        }

        connection.release();
        next(null);
    });
}

export const endTransactionAsync = libs.Promise.promisify(endTransaction);