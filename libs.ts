/// <reference path="./typings/tsd.d.ts" />

export import express = require("express");
export const cookieParser = require('cookie-parser');
export const compression = require("compression");
export import path = require("path");
export import http = require("http");
export var nodeMailer = require("nodemailer");
//export import mysql = require("mysql");

export import Request = express.Request;
export import Response = express.Response;
//export import MysqlError = mysql.IError;
//export import MysqlConnection = mysql.IConnection;
export import ServerResponse = http.ServerResponse;