import * as express from "express";
export { express };

import * as cookieParser from "cookie-parser";
export { cookieParser };

import * as cookie from "cookie";
export { cookie };

import * as bodyParser from "body-parser";
export { bodyParser };

export const Canvas = require("canvas");
export const Image = Canvas.Image;

import * as path from "path";
export { path };

import * as http from "http";
export { http };

import * as url from "url";
export { url };

import * as util from "util";
export { util };

import * as crypto from "crypto";


import * as nodemailer from "nodemailer";
export { nodemailer };

import * as mysql from "mysql";
export { mysql };

import * as mssql from "mssql";
export { mssql };

export function md5(str: string) {
    return crypto.createHash("md5").update(str).digest("hex");
};

import * as uuid from "node-uuid";
export { uuid };

import * as moment from "moment";
export { moment };

import * as Redis from "ioredis";
export { Redis };

import * as fs from "fs";
export { fs };

import * as validator from "validator";
export { validator };

import * as mongoose from "mongoose";
export { mongoose };

import * as semver from "semver";
export { semver };

import * as multer from "multer";
export { multer };

import * as request from "request";
export { request };

import * as qs from "qs";
export { qs };

import ObjectId = mongoose.Types.ObjectId;
export { ObjectId };

export const colors = require("colors");

import * as mime from "mime";
export { mime };

import * as xml2js from "xml2js";
export { xml2js };

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
export { socket };

import * as bluebird from "bluebird";
global.Promise = bluebird;

import * as minimist from "minimist";
export { minimist };

export const difference: <T>(array1: T[], array2: T[]) => T[] = require("lodash.difference");
export const isEmpty: (value: any) => boolean = require("lodash.isempty");
export const omit: (object: {}, props: string | string[]) => any = require("lodash.omit");
export const pick: (object: {}, ...props: string[]) => any = require("lodash.pick");

export const socketioRedis: (options: { port: number; host: string; }) => any = require("socket.io-redis");
