import * as types from "../share/types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

let transporter: libs.nodemailer.Transporter;

export function connect() {
    transporter = libs.nodemailer.createTransport(settings.smtp);
}

export function sendAsync(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
        from: settings.smtp.auth.user,
        to: to,
        subject: subject,
        html: html,
    };
    return new Promise<void>((resolve, reject) => {
        transporter.sendMail(mailOptions, error => {
            if (error) {
                reject(services.error.fromError(error, types.StatusCode.internalServerError));
            } else {
                resolve();
            }
        });
    });
}
