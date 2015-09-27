import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

const transporter = libs.nodeMailer.createTransport({
    host: settings.config.smtp.host,
    auth: {
        user: settings.config.smtp.name,
        pass: settings.config.smtp.password
    }
});

function send(to: string, subject: string, html: string, next: (error: Error) => void) {
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

export const sendAsync = libs.Promise.promisify(send);