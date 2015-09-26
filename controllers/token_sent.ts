import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../enums/enums";
import * as interfaces from "../interfaces/interfaces";

import * as services from "../services/services";

const documentOfCreate: interfaces.ApiDocument = {
    url: "/api/token_sent",
    method: "post",
    documentUrl: "/doc/api/Send token via email.html"
};

export function create(request: libs.Request, response: libs.Response) {
    const documentUrl = documentOfCreate.documentUrl;

    if (services.contentType.isNotJson(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    let emailHead: string = request.body.emailHead;
    let emailTail: string = request.body.emailTail;
    const name = request.body.name;

    if (!emailHead || !emailTail) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    emailHead = emailHead.toLowerCase();
    emailTail = emailTail.toLowerCase();

    services.user.getByEmail(emailHead, emailTail, (error, user) => {
        if (error) {
            services.response.sendDBAccessError(response, error.message, documentUrl);
            return;
        }

        if (user) {
            sendEmail(user.id, user.salt, services.user.getEmail(user), error=> {
                if (error) {
                    services.response.sendEmailServiceError(response, error.message, documentUrl);
                    return;
                }

                services.response.sendCreatedOrModified(response, documentUrl);
            });
        } else {
            const salt = libs.generateUuid();
            services.db.access("insert into users (EmailHead,EmailTail,Name,Salt,Status) values(?,?,?,?,?)", [emailHead, emailTail, name, salt, enums.UserStatus.normal], (error, rows) => {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }

                const id = rows.insertId;

                sendEmail(id, salt, `${emailHead}@${emailTail}`, error=> {
                    if (error) {
                        services.response.sendEmailServiceError(response, error.message, documentUrl);
                        return;
                    }

                    services.logger.log(documentOfCreate.url, request, error=> {
                        if (error) {
                            console.log(error);
                        }

                        services.response.sendCreatedOrModified(response, documentUrl);
                    });
                });
            });
        }
    });
}

function sendEmail(userId: number, salt: string, email: string, next: (error: Error) => void) {
    services.frequency.limit(email, 60 * 60, error=> {
        if (error) {
            next(error);
            return;
        }

        const token = services.authenticationCredential.create(userId, salt);
        const url = `http://${settings.config.website.outerHostName}:${settings.config.website.port}${settings.config.urls.login}?authentication_credential=${token}`;

        services.email.send(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`, next)
    });
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}