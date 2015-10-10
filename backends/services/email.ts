'use strict';

import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let transporter = libs.nodemailer.createTransport({
    host: settings.config.smtp.host,
    auth: {
        user: settings.config.smtp.name,
        pass: settings.config.smtp.password
    }
});

function send(to: string, subject: string, html: string, next: (error: interfaces.E) => void) {
    let mailOptions = {
        from: settings.config.smtp.name,
        to: to,
        subject: subject,
        html: html
    };
    transporter.sendMail(mailOptions, error=> {
        next(services.error.fromError(error, enums.ErrorCode.emailServiceError));
    });
}

export let sendAsync = services.promise.promisify4<string, string, string, void>(send);
