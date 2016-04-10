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

import * as assert from "assert";
export {assert};

import * as nodemailer from "nodemailer";
export {nodemailer};

import * as mysql from "mysql";
export {mysql};

export const md5 = require("md5");

import * as uuid from "node-uuid";

import * as moment from "moment";
export {moment};

import * as _ from "lodash";
export {_};

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

export const cors = require("cors");

import * as colors from "colors";
export {colors};

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
}

export interface Response extends express.Response {
    documentUrl: string;
}

import * as socket from "socket.io";
export {socket};

export function generateUuid() {
    return uuid.v4().replace(/-/g, "");
}

export const renameAsync = (oldPath: string, newPath: string) => {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};
