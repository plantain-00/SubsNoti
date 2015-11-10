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
    },
    maxOrganizationNumberUserCanCreate: number,
    cookieKeys: {
        authenticationCredential: string
    },
    cacheKeys: {
        user: string,
        emailFrequency: string,
        userCaptcha: string,
        userCaptchaFrequency: string
    },
    defaultItemLimit: number,
    imageServer: {
        port: number,
        innerHostName: string,
        outerHostName: string
    },
    ipWhiteList: string[],
    imageUploader: {
        port: number,
        innerHostName: string,
        outerHostName: string
    },
    avatar: string,
    cors: {
        methods: string | string[],
        credentials: boolean,
        origin: Array<string | RegExp>
    }
}

export {SettingsInterface};
