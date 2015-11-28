"use strict";

import * as types from "../types";
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

export function sendAsync(to: string, subject: string, html: string): Promise<void> {
    let mailOptions = {
        from: settings.config.smtp.name,
        to: to,
        subject: subject,
        html: html,
    };
    return new Promise<void>((resolve, reject) => {
        transporter.sendMail(mailOptions, error => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
                return;
            }

            resolve();
        });
    });
}
