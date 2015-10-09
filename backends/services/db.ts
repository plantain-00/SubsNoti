'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let pool = libs.mysql.createPool(settings.config.db);

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

export function accessAsync(sql: string, parameters: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
        access(sql, parameters, (error: Error, rows) => {
            return error !== null ? reject(error) : resolve(rows);
        });
    });
};

export function insertAsync(sql: string, parameters: any[]): Promise<{ insertId: number }> {
    return new Promise((resolve, reject) => {
        access(sql, parameters, (error: Error, rows) => {
            return error !== null ? reject(error) : resolve(rows);
        });
    });
};

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

export function beginTransactionAsync(): Promise<libs.MysqlConnection> {
    return new Promise((resolve, reject) => {
        beginTransaction((error: Error, connection) => {
            return error !== null ? reject(error) : resolve(connection);
        });
    });
};

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

export function accessInTransactionAsync(connection: libs.MysqlConnection, sql: string, parameters: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
        accessInTransaction(connection, sql, parameters, (error: Error, rows) => {
            return error !== null ? reject(error) : resolve(rows);
        });
    });
};

export function insertInTransactionAsync(connection: libs.MysqlConnection, sql: string, parameters: any[]): Promise<{ insertId: number }> {
    return new Promise((resolve, reject) => {
        accessInTransaction(connection, sql, parameters, (error: Error, rows) => {
            return error !== null ? reject(error) : resolve(rows);
        });
    });
};

function rollback(connection: libs.MysqlConnection, next: () => void): void {
    connection.rollback(() => {
        connection.release();
        next();
    });
}

export function rollbackAsync(connection: libs.MysqlConnection): Promise<{}> {
    return new Promise((resolve, reject) => {
        rollback(connection, () => {
            return resolve();
        });
    });
};

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

export function endTransactionAsync(connection: libs.MysqlConnection): Promise<{}> {
    return new Promise((resolve, reject) => {
        endTransaction(connection, error => {
            return error !== null ? reject(error) : resolve();
        });
    });
};