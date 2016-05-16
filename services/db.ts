import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let pool: libs.mysql.IPool;

import MysqlConnection = libs.mysql.IConnection;

export function connect() {
    pool = libs.mysql.createPool(settings.db);
}

function getConnection(): Promise<MysqlConnection> {
    return new Promise<MysqlConnection>((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
            } else {
                resolve(connection);
            }
        });
    });
}

function accessAsync<T>(sql: string, parameters: (string | number)[]): Promise<T> {
    return getConnection().then(connection => {
        return new Promise<T>((resolve, reject) => {
            connection.query(sql, parameters, (error, rows) => {
                connection.release();
                if (error) {
                    reject(services.error.fromError(error, types.StatusCode.internalServerError));
                } else {
                    resolve(rows);
                }
            });
        });
    });
}

export const queryAsync: <T>(sql: string, parameters: (string | number)[]) => Promise<T[]> = accessAsync;

export const insertAsync: (sql: string, parameters: (string | number)[]) => Promise<{ insertId?: number; affectedRows: number; }> = accessAsync;

export function beginTransactionAsync(): Promise<MysqlConnection> {
    return getConnection().then(connection => {
        return new Promise<MysqlConnection>((resolve, reject) => {
            connection.beginTransaction(error => {
                if (error) {
                    connection.release();
                    reject(services.error.fromError(error, types.StatusCode.internalServerError));
                } else {
                    resolve(connection);
                }
            });
        });
    });
}

function accessInTransactionAsync<T>(connection: MysqlConnection, sql: string, parameters: (string | number)[]): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        connection.query(sql, parameters, (error, rows) => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
            } else {
                resolve(rows);
            }
        });
    }).catch(error => {
        return rollbackAsync(connection).then(() => {
            return Promise.reject(error);
        });
    });
}

export const queryInTransactionAsync: <T>(connection: MysqlConnection, sql: string, parameters: (string | number)[]) => Promise<T[]> = accessInTransactionAsync;

export const insertInTransactionAsync: (connection: MysqlConnection, sql: string, parameters: (string | number)[]) => Promise<{ insertId?: number; affectedRows: number; }> = accessInTransactionAsync;

export function rollbackAsync(connection: MysqlConnection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        connection.rollback(() => {
            connection.release();
            resolve();
        });
    });
}

export function endTransactionAsync(connection: MysqlConnection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        connection.commit(error => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
            } else {
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
