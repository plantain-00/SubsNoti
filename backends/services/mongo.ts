'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

import Schema = libs.mongoose.Schema;

export interface OrganizationDocument extends libs.mongoose.Document {
    name: string,
    status: enums.OrganizationStatus,
    creator: UserDocument,
    members: UserDocument[]
}

export interface UserDocument extends libs.mongoose.Document {
    email: string;
    name: string;
    salt: string;
    status: enums.UserStatus;
}

export interface ThemeDocument extends libs.mongoose.Document {
    title: string;
    detail: string;
    status: enums.UserStatus;
    organization: OrganizationDocument;
    creator: UserDocument;
    createTime: Date;
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
        members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }));

    User = libs.mongoose.model<UserDocument>('User', new libs.mongoose.Schema({
        email: String,
        name: String,
        salt: String,
        status: Number
    }));
}

export let Log: libs.mongoose.Model<libs.mongoose.Document>;
export let Organization: libs.mongoose.Model<OrganizationDocument>;
export let User: libs.mongoose.Model<UserDocument>;