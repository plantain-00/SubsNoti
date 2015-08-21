/// <reference path="./typings/tsd.d.ts" />

export import express = require("express");
export const cookieParser = require('cookie-parser');
export const bodyParser = require('body-parser');
export const compression = require("compression");
export import path = require("path");
export import http = require("http");
export const nodeMailer = require("nodemailer");
export import mysql = require("mysql");
export const md5 = require("md5");
const uuid = require("node-uuid");
export import moment = require("moment");
export import _ = require("lodash");
export import redis = require("redis");

export import Request = express.Request;
export import Response = express.Response;
export import MysqlError = mysql.IError;
export import MysqlConnection = mysql.IConnection;
export import ServerResponse = http.ServerResponse;
export import Application = express.Application;

export function generateUuid() {
    return uuid.v4().replace(/-/g, "");
}