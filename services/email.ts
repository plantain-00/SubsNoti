import libs = require("../libs");
import settings = require("../settings");
import services = require("./services");

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