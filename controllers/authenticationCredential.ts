import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export const documentOfCreate:interfaces.ApiDocument = {
    url: "/api/authentication_credential",
    method: "post",
    documentUrl: "/doc/api/Create an authentication credential for a given email.html"
};

export function create(request:libs.Request, response:libs.Response) {
    const documentUrl = documentOfCreate.documentUrl;

    if (services.contentType.isNotJson(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    let emailHead:string = request.body.emailHead;
    let emailTail:string = request.body.emailTail;
    const name = request.body.name;

    if (!emailHead || !emailTail) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    emailHead = emailHead.toLowerCase();
    emailTail = emailTail.toLowerCase();

    services.db.access("select * from users where EmailHead = ? and EmailTail = ?", [emailHead, emailTail], (error, rows)=> {
        if (error) {
            services.response.sendDBAccessError(response, error.message, documentUrl);
            return;
        }

        if (rows.length == 0) {
            const salt = libs.generateUuid();
            services.db.access("insert into users (EmailHead,EmailTail,Name,Salt,Status) values(?,?,?,?,?)", [emailHead, emailTail, name, salt, enums.UserStatus.normal], (error, rows)=> {
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
        } else if (rows.length == 1) {
            const user = services.user.getFromRow(rows[0]);

            sendEmail(user.id, user.salt, services.user.getEmail(user), error=> {
                if (error) {
                    services.response.sendEmailServiceError(response, error.message, documentUrl);
                    return;
                }

                services.response.sendCreatedOrModified(response, documentUrl);
            });
        } else {
            services.response.sendAccountInWrongStatusError(response, "the account is in wrong status now", documentUrl);
        }
    });
}

function sendEmail(userId:number, salt:string, email:string, next:(error:Error)=>void) {
    services.frequency.limit(email, 60 * 60, error=> {
        if (error) {
            next(error);
            return;
        }

        const token = services.authenticationCredential.create(userId, salt);
        const url = `http://${settings.config.website.outerHostName}:${settings.config.website.port}${documentOfGet.url}?authentication_credential=${token}`;

        services.email.send(email, "your authentication credential", `you can click <a href='${url}'>${url}</a> to access the website`, next)
    });
}

export const documentOfGet:interfaces.ApiDocument = {
    url: "/api/authentication_credential.html",
    method: "get",
    documentUrl: "/doc/api/Get authentication credential.html"
};

export function get(request:libs.Request, response:libs.Response) {
    const documentUrl = documentOfGet.documentUrl;

    const authenticationCredential = request.query.authentication_credential;

    if (!authenticationCredential) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    response.cookie(services.cookieKey.authenticationCredential, authenticationCredential, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true
    });

    response.redirect("/index.html");
}

export const documentOfDelete:interfaces.ApiDocument = {
    url: "/api/authentication_credential",
    method: "delete",
    documentUrl: "/doc/api/Delete authentication credential.html"
};

export function deleteThis(request:libs.Request, response:libs.Response) {
    const documentUrl = documentOfDelete.documentUrl;

    response.clearCookie(services.cookieKey.authenticationCredential);

    services.response.sendOK(response, documentUrl);
}

export function route(app:libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
    app[documentOfDelete.method](documentOfDelete.url, deleteThis);

    app[documentOfGet.method](documentOfGet.url, get);
}