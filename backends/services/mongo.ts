'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

import Schema = libs.mongoose.Schema;

interface OrganizationDocument extends libs.mongoose.Document {
    name: string;
    status: enums.OrganizationStatus;

    creator: UserDocument | libs.ObjectId;
    members: Array<UserDocument | libs.ObjectId>;

    themes: Array<ThemeDocument | libs.ObjectId[]>;
}

interface UserDocument extends libs.mongoose.Document {
    email: string;
    name: string;
    salt: string;
    status: enums.UserStatus;

    joinedOrganizations: Array<OrganizationDocument | libs.ObjectId[]>;
    createdOrganizations: Array<OrganizationDocument | libs.ObjectId>;

    ownedThemes: Array<ThemeDocument | libs.ObjectId>;
    watchedThemes: Array<ThemeDocument | libs.ObjectId[]>;
    createdThemes: Array<ThemeDocument | libs.ObjectId[]>;
}

interface ThemeDocument extends libs.mongoose.Document {
    title: string;
    detail: string;
    status: enums.UserStatus;
    createTime: Date;

    creator: UserDocument | libs.ObjectId;
    owners: Array<UserDocument | libs.ObjectId>;
    watchers: Array<UserDocument | libs.ObjectId>;

    organization: OrganizationDocument | libs.ObjectId;
}

export function connect() {
    libs.mongoose.connect(settings.config.mongodb.url, {
        user: settings.config.mongodb.user,
        pass: settings.config.mongodb.password
    });

    libs.mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

    Log = libs.mongoose.model('Log', new libs.mongoose.Schema({
        time: Date,
        content: libs.mongoose.Schema.Types.Mixed
    }));

    Organization = libs.mongoose.model<OrganizationDocument>('Organization', new libs.mongoose.Schema({
        name: String,
        status: Number,

        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }],

        themes: [{ type: Schema.Types.ObjectId, ref: 'Theme' }]
    }));

    User = libs.mongoose.model<UserDocument>('User', new libs.mongoose.Schema({
        email: String,
        name: String,
        salt: String,
        status: Number,

        joinedOrganizations: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],
        createdOrganizations: [{ type: Schema.Types.ObjectId, ref: 'Organization' }],

        ownedThemes: [{ type: Schema.Types.ObjectId, ref: 'Theme' }],
        watchedThemes: [{ type: Schema.Types.ObjectId, ref: 'Theme' }],
        createdThemes: [{ type: Schema.Types.ObjectId, ref: 'Theme' }]
    }));

    Theme = libs.mongoose.model<ThemeDocument>('Theme', new libs.mongoose.Schema({
        title: String,
        detail: String,
        status: Number,
        createTime: Date,

        creator: { type: Schema.Types.ObjectId, ref: 'User' },
        owners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        watchers: [{ type: Schema.Types.ObjectId, ref: 'User' }],

        organization: { type: Schema.Types.ObjectId, ref: 'Organization' }
    }));
}

export let Log: libs.mongoose.Model<libs.mongoose.Document>;
export let Organization: libs.mongoose.Model<OrganizationDocument>;
export let User: libs.mongoose.Model<UserDocument>;
export let Theme: libs.mongoose.Model<ThemeDocument>;
