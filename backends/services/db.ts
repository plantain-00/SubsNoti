'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let pool = libs.mysql.createPool(settings.config.db);

function promisify1<TResult>(callback: (next: (error: Error, result: TResult) => void) => void): () => Promise<TResult> {
    return () => {
        return new Promise((resolve, reject) => {
            callback((error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}

function promisify2<T1, TResult>(callback: (t1: T1, next: (error: Error, result: TResult) => void) => void): (t1: T1) => Promise<TResult> {
    return (t1: T1) => {
        return new Promise((resolve, reject) => {
            callback(t1, (error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}

function promisify3<T1, T2, TResult>(callback: (t1: T1, t2: T2, next: (error: Error, result: TResult) => void) => void): (t1: T1, t2: T2) => Promise<TResult> {
    return (t1: T1, t2: T2) => {
        return new Promise((resolve, reject) => {
            callback(t1, t2, (error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}

function promisify4<T1, T2, T3, TResult>(callback: (t1: T1, t2: T2, t3: T3, next: (error: Error, result: TResult) => void) => void): (t1: T1, t2: T2, t3: T3) => Promise<TResult> {
    return (t1: T1, t2: T2, t3: T3) => {
        return new Promise((resolve, reject) => {
            callback(t1, t2, t3, (error: Error, result: TResult) => {
                return error !== null ? reject(error) : resolve(result);
            });
        });
    };
}

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

export let accessAsync = promisify3<string, any[], any[]>(access);

export let insertAsync = promisify3<string, any[], { insertId: number }>(access);

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

export let beginTransactionAsync = promisify1<libs.MysqlConnection>(beginTransaction);

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

export let accessInTransactionAsync = promisify4<libs.MysqlConnection, string, any[], any[]>(accessInTransaction);

export let insertInTransactionAsync = promisify4<libs.MysqlConnection, string, any[], { insertId: number }>(accessInTransaction);

function rollback(connection: libs.MysqlConnection, next: () => void): void {
    connection.rollback(() => {
        connection.release();
        next();
    });
}

export let rollbackAsync = promisify2<libs.MysqlConnection, void>(rollback);

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

export let endTransactionAsync = promisify2<libs.MysqlConnection, void>(endTransaction);
