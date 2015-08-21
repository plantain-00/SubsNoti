import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

var transporter = libs.nodeMailer.createTransport({
    host: settings.config.smtp.host,
    auth: {
        user: settings.config.smtp.name,
        pass: settings.config.smtp.password
    }
});

export function send(to:string, subject:string, text:string, next:(error:Error)=>void) {
    var mailOptions = {
        from: settings.config.smtp.name,
        to: to,
        subject: subject,
        text: text
    };
    transporter.sendMail(mailOptions, error=> {
        next(error);
    });
}