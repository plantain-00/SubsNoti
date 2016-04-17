"use strict";
const libs = require("../libs");
const settings = require("../settings");
var Schema = libs.mongoose.Schema;
function connect() {
    libs.mongoose.connect(settings.mongodb.url, settings.mongodb.options);
    libs.mongoose.connection.on("error", console.error.bind(console, "connection error:"));
    exports.Log = libs.mongoose.model("Log", new libs.mongoose.Schema({
        time: Date,
        content: libs.mongoose.Schema.Types.Mixed,
    }));
    exports.Organization = libs.mongoose.model("Organization", new libs.mongoose.Schema({
        name: String,
        status: Number,
        creator: { type: Schema.Types.ObjectId, ref: "User" },
        members: [{ type: Schema.Types.ObjectId, ref: "User" }],
        themes: [{ type: Schema.Types.ObjectId, ref: "Theme" }],
    }));
    exports.User = libs.mongoose.model("User", new libs.mongoose.Schema({
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
    exports.Theme = libs.mongoose.model("Theme", new libs.mongoose.Schema({
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
    exports.Application = libs.mongoose.model("Application", new libs.mongoose.Schema({
        name: String,
        homeUrl: String,
        description: String,
        authorizationCallbackUrl: String,
        clientId: String,
        clientSecret: String,
        creator: { type: Schema.Types.ObjectId, ref: "User" },
    }));
    exports.AccessToken = libs.mongoose.model("AccessToken", new libs.mongoose.Schema({
        description: String,
        value: String,
        scopes: [String],
        lastUsed: { type: Date },
        creator: { type: Schema.Types.ObjectId, ref: "User" },
        application: { type: Schema.Types.ObjectId, ref: "Application" },
    }));
}
exports.connect = connect;
