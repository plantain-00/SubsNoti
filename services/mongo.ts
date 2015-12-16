import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

import Schema = libs.mongoose.Schema;

export let Log: libs.mongoose.Model<libs.mongoose.Document>;
export let Organization: libs.mongoose.Model<OrganizationDocument>;
export let User: libs.mongoose.Model<UserDocument>;
export let Theme: libs.mongoose.Model<ThemeDocument>;
export let Application: libs.mongoose.Model<ApplicationDocument>;
export let AccessToken: libs.mongoose.Model<AccessTokenDocument>;

export interface MongooseArray<T> extends Array<T> {
    pull: (T) => void;
}

export interface OrganizationDocument extends libs.mongoose.Document {
    name: string;
    status: types.OrganizationStatus;

    creator: UserDocument | libs.ObjectId;
    members: Array<UserDocument | libs.ObjectId>;

    themes: Array<ThemeDocument | libs.ObjectId>;
}

export interface UserDocument extends libs.mongoose.Document {
    email: string;
    name: string;
    salt: string;
    status: types.UserStatus;
    avatar: string;

    joinedOrganizations: Array<OrganizationDocument | libs.ObjectId>;
    createdOrganizations: Array<OrganizationDocument | libs.ObjectId>;

    ownedThemes: Array<ThemeDocument | libs.ObjectId>;
    watchedThemes: Array<ThemeDocument | libs.ObjectId>;
    createdThemes: Array<ThemeDocument | libs.ObjectId>;
}

export interface ThemeDocument extends libs.mongoose.Document {
    title: string;
    detail: string;
    status: types.ThemeStatus;
    createTime: Date;
    updateTime: Date;

    creator: UserDocument | libs.ObjectId;
    owners: Array<UserDocument | libs.ObjectId>;
    watchers: Array<UserDocument | libs.ObjectId>;

    organization: OrganizationDocument | libs.ObjectId;
}

export interface ApplicationDocument extends libs.mongoose.Document {
    name: string;
    homeUrl: string;
    description: string;
    authorizationCallbackUrl: string;
    clientId: string;
    clientSecret: string;

    creator: UserDocument | libs.ObjectId;
}

export interface AccessTokenDocument extends libs.mongoose.Document {
    description: string;
    value: string;
    scopes: string[];

    creator: UserDocument | libs.ObjectId;

    application: ApplicationDocument | libs.ObjectId;
}

export function connect() {
    let mongodb = settings.mongodb.get(settings.currentEnvironment);
    libs.mongoose.connect(mongodb.url, mongodb.options);

    libs.mongoose.connection.on("error", console.error.bind(console, "connection error:"));

    Log = libs.mongoose.model("Log", new libs.mongoose.Schema({
        time: Date,
        content: libs.mongoose.Schema.Types.Mixed,
    }));

    Organization = libs.mongoose.model<OrganizationDocument>("Organization", new libs.mongoose.Schema({
        name: String,
        status: Number,

        creator: { type: Schema.Types.ObjectId, ref: "User" },
        members: [{ type: Schema.Types.ObjectId, ref: "User" }],

        themes: [{ type: Schema.Types.ObjectId, ref: "Theme" }],
    }));

    User = libs.mongoose.model<UserDocument>("User", new libs.mongoose.Schema({
        email: String,
        name: String,
        salt: String,
        status: Number,
        avatar: String,

        joinedOrganizations: [{ type: Schema.Types.ObjectId, ref: "Organization" }],
        createdOrganizations: [{ type: Schema.Types.ObjectId, ref: "Organization" }],

        ownedThemes: [{ type: Schema.Types.ObjectId, ref: "Theme" }],
        watchedThemes: [{ type: Schema.Types.ObjectId, ref: "Theme" }],
        createdThemes: [{ type: Schema.Types.ObjectId, ref: "Theme" }],
    }));

    Theme = libs.mongoose.model<ThemeDocument>("Theme", new libs.mongoose.Schema({
        title: String,
        detail: String,
        status: Number,
        createTime: Date,
        updateTime: Date,

        creator: { type: Schema.Types.ObjectId, ref: "User" },
        owners: [{ type: Schema.Types.ObjectId, ref: "User" }],
        watchers: [{ type: Schema.Types.ObjectId, ref: "User" }],

        organization: { type: Schema.Types.ObjectId, ref: "Organization" },
    }));

    Application = libs.mongoose.model<ApplicationDocument>("Application", new libs.mongoose.Schema({
        name: String,
        homeUrl: String,
        description: String,
        authorizationCallbackUrl: String,
        clientId: String,
        clientSecret: String,

        creator: { type: Schema.Types.ObjectId, ref: "User" },
    }));

    AccessToken = libs.mongoose.model<AccessTokenDocument>("AccessToken", new libs.mongoose.Schema({
        description: String,

        scopes: [String],

        creator: { type: Schema.Types.ObjectId, ref: "User" },

        application: { type: Schema.Types.ObjectId, ref: "Application" },
    }));
}
