var libs = require("../libs");
var settings = require("../settings");
var transporter = libs.nodeMailer.createTransport({
    host: settings.config.smtp.host,
    auth: {
        user: settings.config.smtp.name,
        pass: settings.config.smtp.password
    }
});
function send(to, subject, text, next) {
    var mailOptions = {
        from: settings.config.smtp.name,
        to: to,
        subject: subject,
        text: text
    };
    transporter.sendMail(mailOptions, function (error) {
        next(error);
    });
}
exports.send = send;
//# sourceMappingURL=email.js.map