interface SettingsInterface {
    environment: string,
    db: {
        host: string,
        user: string,
        password: string,
        database: string
    },
    website: {
        port: number,
        innerHostName: string,
        outerHostName: string
    },
    smtp: {
        host: string,
        name: string,
        password: string
    },
    redis: {
        host: string
        port: number,
        options: {
            auth_pass: string
        }
    },
    mongodb: {
        url: string,
        user: string,
        password: string
    },
    urls: {
        login: string
    }
}

export {SettingsInterface};
