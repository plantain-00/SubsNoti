/// <reference path="./typings/tsd.d.ts" />

"use strict";

import * as express from "express";
export {express};

import * as cookieParser from "cookie-parser";
export {cookieParser};

import * as cookie from "cookie";
export {cookie};

export let bodyParser = require("body-parser");

export let compression = require("compression");

export let Canvas = require("canvas");
export let Image = Canvas.Image;

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

export let md5 = require("md5");

import * as uuid from "node-uuid";

import * as moment from "moment";
export {moment};

import * as _ from "lodash";
export {_};

import * as redis from "redis";
export {redis};

import * as fs from "fs";
export {fs};

import * as validator from "validator";
export {validator};

import * as mongoose from "mongoose";
export {mongoose};

import * as semver from "semver";
export {semver};

export let multer = require("multer");

import * as request from "request";
export {request};

import * as qs from "qs";
export {qs};

import ObjectId = mongoose.Types.ObjectId;
export {ObjectId};

export let cors = require("cors");

import * as colors from "colors";
export {colors};

export interface Request extends express.Request {
    v: string;
    files: any[];
    userId: ObjectId;
}

export interface Response extends express.Response {
    documentUrl: string;
}

import * as socket from "socket.io";
export {socket};

export function generateUuid() {
    return uuid.v4().replace(/-/g, "");
}

export let renameAsync = (oldPath: string, newPath: string) => {
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
