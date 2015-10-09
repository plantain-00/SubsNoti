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

function send(to: string, subject: string, html: string, next: (error: Error) => void) {
    let mailOptions = {
        from: settings.config.smtp.name,
        to: to,
        subject: subject,
        html: html
    };
    transporter.sendMail(mailOptions, error=> {
        next(error);
    });
}

export function sendAsync(to: string, subject: string, html: string): Promise<{}> {
    return new Promise((resolve, reject) => {
        send(to, subject, html, error => {
            return error !== null ? reject(error) : resolve();
        });
    });
};
