import * as libs from "../libs";
import * as services from "../services";

import MSSqlConnection = libs.mssql.Connection;

let pool: MSSqlConnection;

export function connect() {
    const mssqlConfig = {
        user: process.env.SUBS_NOTI_MSSQL_USER,
        password: process.env.SUBS_NOTI_MSSQL_PASSWORD,
        server: process.env.SUBS_NOTI_MSSQL_SERVER,
        database: process.env.SUBS_NOTI_MSSQL_DATABASE,
        pool: {
            max: process.env.SUBS_NOTI_MSSQL_MIN_CONNECTION === undefined ? process.env.SUBS_NOTI_MSSQL_MIN_CONNECTION : 0,
            min: process.env.SUBS_NOTI_MSSQL_MAX_CONNECTION === undefined ? process.env.SUBS_NOTI_MSSQL_MAX_CONNECTION : 10,
            idleTimeoutMillis: 30000,
        },
    };
    services.logger.logInfo({ mssqlConfig });

    pool = new MSSqlConnection(mssqlConfig, error => {
        if (error) {
            services.logger.logError(error);
        }
    });
}

export function getCommand() {
    return new libs.mssql.Request(pool);
}
