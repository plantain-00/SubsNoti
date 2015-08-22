/// <reference path="./typings/tsd.d.ts" />
exports.express = require("express");
exports.cookieParser = require('cookie-parser');
exports.bodyParser = require('body-parser');
exports.compression = require("compression");
exports.path = require("path");
exports.http = require("http");
exports.nodeMailer = require("nodemailer");
exports.mysql = require("mysql");
exports.md5 = require("md5");
var uuid = require("node-uuid");
exports.moment = require("moment");
exports._ = require("lodash");
exports.redis = require("redis");
exports.fs = require('fs');
function generateUuid() {
    return uuid.v4().replace(/-/g, "");
}
exports.generateUuid = generateUuid;
//# sourceMappingURL=libs.js.map