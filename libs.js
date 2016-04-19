/// <reference path="./typings/tsd.d.ts" />
"use strict";
const express = require("express");
exports.express = express;
const cookieParser = require("cookie-parser");
exports.cookieParser = cookieParser;
const cookie = require("cookie");
exports.cookie = cookie;
exports.bodyParser = require("body-parser");
exports.compression = require("compression");
exports.Canvas = require("canvas");
exports.Image = exports.Canvas.Image;
const path = require("path");
exports.path = path;
const http = require("http");
exports.http = http;
const url = require("url");
exports.url = url;
const assert = require("assert");
exports.assert = assert;
const nodemailer = require("nodemailer");
exports.nodemailer = nodemailer;
const mysql = require("mysql");
exports.mysql = mysql;
exports.md5 = require("md5");
const uuid = require("node-uuid");
const moment = require("moment");
exports.moment = moment;
const _ = require("lodash");
exports._ = _;
const Redis = require("ioredis");
exports.Redis = Redis;
const fs = require("fs");
exports.fs = fs;
const validator = require("validator");
exports.validator = validator;
const mongoose = require("mongoose");
exports.mongoose = mongoose;
const semver = require("semver");
exports.semver = semver;
exports.multer = require("multer");
const request = require("request");
exports.request = request;
const qs = require("qs");
exports.qs = qs;
var ObjectId = mongoose.Types.ObjectId;
exports.ObjectId = ObjectId;
exports.cors = require("cors");
const colors = require("colors");
function green(message) {
    console.log(green(message));
}
exports.green = green;
function red(message) {
    console.log(red(message));
}
exports.red = red;
const mime = require("mime");
exports.mime = mime;
const socket = require("socket.io");
exports.socket = socket;
function generateUuid() {
    return uuid.v4().replace(/-/g, "");
}
exports.generateUuid = generateUuid;
exports.renameAsync = (oldPath, newPath) => {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, error => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
};
