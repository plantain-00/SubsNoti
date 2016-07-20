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
export function md5(str: string) {
    return crypto.createHash("md5").update(str).digest("hex");
};
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
import ObjectId = mongoose.Types.ObjectId;
export { ObjectId };
export const colors = require("colors");
import * as mime from "mime";
import * as xml2js from "xml2js";

type File = {
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
    userId: ObjectId | null;
    // scopes that this access token can be used in
    scopes: string[];
    // application's id that this access token can be used for
    application: ObjectId;
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

export {
    express, minimist, cookieParser, cookie, bodyParser,
    path, http, url, util, nodemailer,
    mysql, mssql, uuid, moment, Redis,
    fs, validator, mongoose, semver, multer,
    request, qs, mime, xml2js, socket,
    socketioRedis,
};

export const difference: <T>(array1: T[], array2: T[]) => T[] = require("lodash.difference");
export const isEmpty: (value: any) => boolean = require("lodash.isempty");
export const omit: (object: {}, props: string | string[]) => any = require("lodash.omit");
export const pick: (object: {}, ...props: string[]) => any = require("lodash.pick");
