import * as libs from "../libs";

let pool: libs.mysql.IPool;

import MysqlConnection = libs.mysql.IConnection;

const config: { host: string; user: string; password: string; database: string; } = undefined;

export function connect() {
    pool = libs.mysql.createPool(config);
}

function getConnection(): Promise<MysqlConnection> {
    return new Promise<MysqlConnection>((resolve, reject) => {
        pool.getConnection((error, connection) => {
            if (error) {
                reject(error);
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
                    reject(error);
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
                    reject(error);
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
                reject(error);
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
                reject(error);
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
