"use strict";
const types = require("../share/types");
const libs = require("../libs");
const settings = require("../settings");
const services = require("../services");
let transporter;
function connect() {
    transporter = libs.nodemailer.createTransport(settings.smtp);
}
exports.connect = connect;
function sendAsync(to, subject, html) {
    const mailOptions = {
        from: settings.smtp.auth.user,
        to: to,
        subject: subject,
        html: html,
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, error => {
            if (error) {
                reject(services.error.fromError(error, 500 /* internalServerError */));
            }
            else {
                resolve();
            }
        });
    });
}
exports.sendAsync = sendAsync;
