import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as cookie from "cookie";
import * as bodyParser from "body-parser";
export const Canvas = require("canvas");
export const Image = Canvas.Image;
import * as path from "path";
import * as http from "http";
import * as url from "url";
import * as util from "util";
import * as crypto from "crypto";
import * as nodemailer from "nodemailer";
import * as mysql from "mysql";
import * as mssql from "mssql";
export function md5(str: string): string {
    return crypto.createHash("md5").update(str).digest("hex");
};
export function sha256(str: string): string {
    return crypto.createHash("sha256").update(str).digest("base64");
}
import * as uuid from "node-uuid";
import * as moment from "moment";
import * as Redis from "ioredis";
import * as fs from "fs";
import * as validator from "validator";
import * as mongoose from "mongoose";
import * as semver from "semver";
import * as multer from "multer";
import * as request from "request";
import * as qs from "qs";
export const colors = require("colors");
import * as mime from "mime";
import * as xml2js from "xml2js";
import * as helmet from "helmet";

export type File = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
};

export type Request = express.Request & {
    // version
    v: string;
    // files upload
    // user's id for validation in cookies or headers
    userId: mongoose.Types.ObjectId | null;
    // scopes that this access token can be used in
    scopes: string[];
    // application's id that this access token can be used for
    application: mongoose.Types.ObjectId;
    uploadPath: string;
    file: File;
    files: File[] & {
        [fieldname: string]: File;
    };
};

export type Response = express.Response & {
    documentUrl: string;
};

import * as socket from "socket.io";

import * as bluebird from "bluebird";
global.Promise = bluebird;

import * as minimist from "minimist";
import * as socketioRedis from "socket.io-redis";
import { __awaiter } from "tslib";
import * as difference from "lodash/difference";
import * as isEmpty from "lodash/isEmpty";
import * as omit from "lodash/omit";
import * as pick from "lodash/pick";

export {
    express, minimist, cookieParser, cookie, bodyParser,
    path, http, url, util, nodemailer,
    mysql, mssql, uuid, moment, Redis,
    fs, validator, mongoose, semver, multer,
    request, qs, mime, xml2js, socket,
    socketioRedis, helmet, __awaiter, difference, isEmpty,
    omit, pick,
};
