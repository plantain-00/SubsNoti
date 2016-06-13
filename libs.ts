/// <reference path="./typings/tsd.d.ts" />

import * as express from "express";
export {express};

import * as cookieParser from "cookie-parser";
export {cookieParser};

import * as cookie from "cookie";
export {cookie};

export const bodyParser = require("body-parser");

export const compression = require("compression");

export const Canvas = require("canvas");
export const Image = Canvas.Image;

import * as path from "path";
export {path};

import * as http from "http";
export {http};

import * as url from "url";
export {url};

import * as util from "util";
export {util};


import * as nodemailer from "nodemailer";
export {nodemailer};

import * as mysql from "mysql";
export {mysql};

export const md5 = require("md5");

import * as uuid from "node-uuid";
export {uuid};

import * as moment from "moment";
export {moment};

import * as Redis from "ioredis";
export {Redis};

import * as fs from "fs";
export {fs};

import * as validator from "validator";
export {validator};

import * as mongoose from "mongoose";
export {mongoose};

import * as semver from "semver";
export {semver};

export const multer = require("multer");

import * as request from "request";
export {request};

import * as qs from "qs";
export {qs};

import ObjectId = mongoose.Types.ObjectId;
export {ObjectId};

export const colors = require("colors");

import * as mime from "mime";
export {mime};

export interface Request extends express.Request {
    // version
    v: string;
    // files upload
    file: any;
    files: any[];
    // user's id for validation in cookies or headers
    userId: ObjectId;
    // scopes that this access token can be used in
    scopes: string[];
    // application's id that this access token can be used for
    application: ObjectId;
    uploadPath: string;
}

export interface Response extends express.Response {
    documentUrl: string;
}

import * as socket from "socket.io";
export {socket};

import * as bluebird from "bluebird";
global.Promise = bluebird;

export const difference: <T>(array1: T[], array2: T[]) => T[] = require("lodash.difference");
export const isEmpty: (value: any) => boolean = require("lodash.isempty");
export const omit: (object: {}, props: string | string[]) => any = require("lodash.omit");
export const pick: (object: {}, ...props: string[]) => any = require("lodash.pick");

export const minimist: ((args: string[]) => any) = require("minimist");
