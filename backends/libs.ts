/// <reference path="../typings/tsd.d.ts" />

"use strict";
/**
 * anything from node modules immediately.
 */

import * as express from "express";
export {express};

export let cookieParser = require("cookie-parser");

export let bodyParser = require("body-parser");

export let compression = require("compression");

export let Canvas = require("canvas");
export let Image = Canvas.Image;

import * as path from "path";
export {path};

import * as http from "http";
export {http};

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

import ObjectId = mongoose.Types.ObjectId;
export {ObjectId};

export let cors = require("cors");

export interface Request extends express.Request {
    v: string;
    files: any[];
}

import Response = express.Response;
export {Response};

import Application = express.Application;
export {Application};

import RedisClient = redis.RedisClient;
export {RedisClient};

export function generateUuid() {
    return uuid.v4().replace(/-/g, "");
}
