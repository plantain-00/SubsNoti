import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

let transporter: libs.nodemailer.Transporter;
const config = {
    host: process.env.SUBS_NOTI_SMTP_HOST,
    auth: {
        user: process.env.SUBS_NOTI_SMTP_USER,
        pass: process.env.SUBS_NOTI_SMTP_PASSWORD,
    },
};

export function connect() {
    transporter = libs.nodemailer.createTransport(config);
}

export function sendAsync(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
        from: config.auth.user,
        to,
        subject,
        html,
    };
    return new Promise<void>((resolve, reject) => {
        transporter.sendMail(mailOptions, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
