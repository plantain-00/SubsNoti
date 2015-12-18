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

function stringEnumify<T extends { [prop: string]: "" | string }>(obj: T) {
    return obj;
}

export type ThemeOrderType = "newest" | "recently updated";

export const themeOrder = stringEnumify({
    newest: "newest",
    recentlyUpdated: "recently updated",
});

export const enum ThemeStatus {
    open,
    closed
}

export type ThemeStatusType = "open" | "closed";

export const themeStatus = stringEnumify({
    open: "open",
    closed: "closed",
});

export const enum UserStatus {
    normal
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

export interface User {
    id: string;
    name: string;
    email?: string;
    avatar: string;
    createdOrganizationCount?: number;
    joinedOrganizationCount?: number;
}

export interface UserResult {
    user: User;
}

export interface CurrentUserResponse extends Response, UserResult { }

export interface VersionResult {
    version: string;
}

export interface VersionResponse extends Response, VersionResult { }

export interface CaptchaResult {
    url: string;
    code?: string;
}

export interface CaptchaResponse extends Response, CaptchaResult { }

export interface TokenResult {
    url?: string;
}

export interface TokenResponse extends Response, TokenResult { }

export interface Organization {
    id: string;
    name: string;
}

export interface OrganizationsResult {
    organizations: Organization[];
}

export interface OrganizationsResponse extends Response, OrganizationsResult { }

export type HttpMethod = "get" | "post" | "put" | "delete";

export const httpMethod = stringEnumify({
    get: "get",
    post: "post",
    put: "put",
    delete: "delete",
});

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

export const environment = stringEnumify({
    development: "development",
    test: "test",
    production: "production",
});

export type ThemePushEvent = "theme created" | "theme updated";

export const themePushEvents = stringEnumify({
    themeCreated: "theme created",
    themeUpdated: "theme updated",
});

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
export interface ThemesResult {
    themes: Theme[];
    totalCount: number;
}

export interface ThemesResponse extends Response, ThemesResult { }

export interface TemperaryResponse extends Response {
    names: string[];
}

export type ScopeName = "read:user" | "write:user"
    | "read:organization" | "write:organization"
    | "read:theme" | "write:theme"
    | "read:application" | "write:application" | "delete:application"
    | "read:access_token" | "write:access_token" | "delete:access_token";

export const scopeNames = stringEnumify({
    readUser: "read:user",
    writeUser: "write:user",
    readOrganization: "read:organization",
    writeOrganization: "write:organization",
    readTheme: "read:theme",
    writeTheme: "write:theme",
    readApplication: "read:application",
    writeApplication: "write:application",
    deleteApplication: "delete:application",
    readAccessToken: "read:access_token",
    writeAccessToken: "write:access_token",
    deleteAccessToken: "delete:access_token",
});

export interface Scope {
    name: ScopeName;
    description: string;
}

export interface ScopesResult {
    scopes: Scope[];
}

export interface ScopesResponse extends Response, ScopesResult { }

export interface Application {
    id: string;
    name: string;
    homeUrl: string;
    description: string;
    authorizationCallbackUrl?: string;
    clientId?: string;
    clientSecret?: string;
    creator?: User;
    scopes?: Scope[];
    lastUsed?: string;
}

export interface ApplicationsResult {
    applications: Application[];
}

export interface ApplicationsResponse extends Response, ApplicationsResult { }

export interface ApplicationResult {
    application: Application;
}

export interface ApplicationResponse extends Response, ApplicationResult { }

export interface AccessToken {
    id: string;
    description: string;
    scopes?: Scope[];
    lastUsed: string;
}

export interface AccessTokensResult {
    accessTokens: AccessToken[];
}

export interface AccessTokensResponse extends Response, AccessTokensResult { }

export interface GeneratedAccessTokenResult {
    accessToken: string;
}

export interface GeneratedAccessTokenResponse extends Response, GeneratedAccessTokenResult { }

export type ResponseType = "json" | "others";

export const responseType = stringEnumify({
    json: "json",
    others: "others",
});

export interface TestSeed {
    email: string;
    name: string;

    organizationName: string;

    themeTitle: string;
    themeDetail: string;

    newThemeTitle: string;
    newThemeDetail: string;

    newName: string;

    clientName: string;
    clientEmail: string;

    applicationName: string;
    applicationHomeUrl: string;
    applicationDescription: string;
    applicationAuthorizationCallbackUrl: string;

    newApplicationName: string;
    newApplicationHomeUrl: string;
    newApplicationDescription: string;
    newApplicationAuthorizationCallbackUrl: string;
}

export const yes = "√";
export const no = "X";

export interface OAuthCodeValue {
    scopes: string[];
    creator: string;
    application: string;
    state: string;
    confirmed: boolean;
}
