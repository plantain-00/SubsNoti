/// <reference path="./typings/tsd.d.ts" />

import * as express from "express";
export {express};

export const cookieParser = require('cookie-parser');

export const bodyParser = require('body-parser');

export const compression = require("compression");

import * as path from "path";
export {path};

import * as http from "http";
export {http};

import * as assert from "assert";
export {assert};

export const nodeMailer = require("nodemailer");

import * as mysql from "mysql";
export {mysql};

export const md5 = require("md5");

const uuid = require("node-uuid");

import * as moment from "moment";
export {moment};

import * as _ from "lodash";
export {_};

import * as redis from "redis";
export {redis};

import * as fs from 'fs';
export {fs};

import * as mongodb from 'mongodb';
export {mongodb};

import Request = express.Request;
export {Request};

import Response = express.Response;
export {Response};

import MysqlError = mysql.IError;
export {MysqlError};

import MysqlConnection = mysql.IConnection;
export {MysqlConnection};

import ServerResponse = http.ServerResponse;
export {ServerResponse};

import Application = express.Application;
export {Application};

import Collection = mongodb.Collection;
export {Collection};

import RedisClient = redis.RedisClient;
export {RedisClient};

export function generateUuid() {
    return uuid.v4().replace(/-/g, "");
}