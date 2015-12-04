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

export type ThemeOrderType = "newest" | "recently updated";

export const themeOrder = {
    newest: <ThemeOrderType>"newest",
    recentlyUpdated: <ThemeOrderType>"recently updated",
};

export const enum ThemeStatus {
    open,
    closed
}

export type ThemeStatusType = "open" | "closed";

export const themeStatus = {
    open: <ThemeStatusType>"open",
    closed: <ThemeStatusType>"closed",
};

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

export type HttpMethod = "get" | "post" | "put" | "delete";

export const httpMethod = {
    get: <HttpMethod>"get",
    post: <HttpMethod>"post",
    put: <HttpMethod>"put",
    delete: <HttpMethod>"delete",
};

export interface Document {
    url: string;
    method: HttpMethod;
    documentUrl: string;
}

export interface ObsoleteDocument extends Document {
    versionRange: string;
    expiredDate: string;
}

export type Environment = "development" | "test" | "production";

export const environment = {
    development: <Environment>"development",
    test: <Environment>"test",
    production: <Environment>"production",
};

export type PushEvent = "theme created" | "theme updated";

export const pushEvents = {
    themeCreated: <PushEvent>"theme created",
    themeUpdated: <PushEvent>"theme updated",
};

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
}

export interface Theme {
    id: string;
    title: string;
    detail: string;
    organizationId: string;
    createTime: string;
    updateTime?: string;
    status: ThemeStatusType;
    creator: User;
    owners: User[];
    watchers: User[];
}

export type ResponseType = "json" | "html";

export const responseType = {
    json: <ResponseType>"json",
    html: <ResponseType>"html",
};

export interface TestSeed {
    email: string;
    name: string;
    organizationName: string;
    themeTitle: string;
    themeDetail: string;
    newThemeTitle: string;
    newThemeDetail: string;
}
