/**
 * enum, interface, class, type. do not rely on other thing.
 */

export const enum LoginStatus {
    unknown = 0,
    fail = 1,
    success = 2
}

export const enum OrganizationStatus {
    normal
}

export const enum StatusCode {
    OK = 200,
    createdOrModified = 201,
    accepted = 202,
    deleted = 204,
    invalidRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    notAcceptable = 406,
    gone = 410,
    unprocessableEntity = 422,
    tooManyRequest = 429,
    internalServerError = 500
}

export const enum ThemeOrder {
    newest,
    recentlyUpdated
}

export const enum ThemeStatus {
    open,
    closed
}

export const enum UserStatus {
    normal
}

export interface CurrentUserResponse {
    id: string;
    email: string;
    name: string;
    createdOrganizationCount: number;
    joinedOrganizationCount: number;
    avatar: string;
}

export interface E extends Error {
    statusCode: StatusCode;
}

export interface Response {
    isSuccess: boolean;
    statusCode: StatusCode;
    errorMessage?: string;
    stack?: string;
    documentUrl?: string;
    actualErrorMessage?: string;
}

export interface Document {
    url: string;
    method: "get" | "post" | "put" | "delete";
    documentUrl: string;
}

export type environment = "development" | "production";

export interface SettingsInterface {
    currentEnvironment: environment;
    environment: {
        development: environment;
        production: environment;
    };
    db: {
        host: string,
        user: string,
        password: string,
        database: string
    };
    website: {
        port: number,
        innerHostName: string,
        outerHostName: string
    };
    smtp: {
        host: string,
        name: string,
        password: string
    };
    redis: {
        host: string
        port: number,
        options: {
            auth_pass: string
        }
    };
    mongodb: {
        url: string,
        user: string,
        password: string
    };
    urls: {
        login: string
    };
    maxOrganizationNumberUserCanCreate: number;
    cookieKeys: {
        authenticationCredential: string
    };
    cacheKeys: {
        user: string,
        emailFrequency: string,
        userCaptcha: string,
        userCaptchaFrequency: string
    };
    defaultItemLimit: number;
    imageServer: {
        port: number,
        innerHostName: string,
        outerHostName: string
    };
    ipWhiteList: string[];
    imageUploader: {
        port: number,
        innerHostName: string,
        outerHostName: string
    };
    avatar: string;
    cors: {
        methods: string | string[],
        credentials: boolean,
        origin: Array<string | RegExp>
    };
}
