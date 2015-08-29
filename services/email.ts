import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

const transporter = libs.nodeMailer.createTransport({
    host: settings.config.smtp.host,
    auth: {
        user: settings.config.smtp.name,
        pass: settings.config.smtp.password
    }
});

export function send(to:string, subject:string, html:string, next:(error:Error)=>void) {
    const mailOptions = {
        from: settings.config.smtp.name,
        to: to,
        subject: subject,
        html: html
    };
    transporter.sendMail(mailOptions, error=> {
        next(error);
    });
}