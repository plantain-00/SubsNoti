"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let transporter = libs.nodemailer.createTransport({
    host: settings.config.smtp.host,
    auth: {
        user: settings.config.smtp.name,
        pass: settings.config.smtp.password,
    },
});

function send(to: string, subject: string, html: string, next: (error: types.E) => void) {
    let mailOptions = {
        from: settings.config.smtp.name,
        to: to,
        subject: subject,
        html: html,
    };
    transporter.sendMail(mailOptions, error => {
        next(services.error.fromError(error, types.StatusCode.internalServerError));
    });
}

export let sendAsync = services.promise.promisify4<string, string, string, void>(send);
