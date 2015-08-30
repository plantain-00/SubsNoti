import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");

import services = require("../services/services");

export const createDocument:interfaces.ApiDocument = {
    name: "get a authentication credential for a given email",
    url: "/api/authentication_credential",
    description: "will send a link with it to the given email",
    method: "post",
    contentType: "application/json",
    expirationDate: "no",
    versions: [{
        expirationDate: "no",
        parameters: {
            v: 1
        },
        requestBody: {
            emailHead: {
                type: "string",
                required: true
            },
            emailTail: {
                type: "string",
                required: true
            },
            name: {
                type: "string"
            }
        },
        responseBody: {
            isSuccess: {
                type: "boolean"
            },
            statusCode: {
                type: "number"
            },
            errorCode: {
                type: "number"
            },
            errorMessage: {
                type: "string"
            }
        }
    }]
};

export function create(request:libs.Request, response:libs.Response) {
    const documentUrl = createDocument.documentUrl;

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

                    services.logger.log(createDocument.url, request, error=> {
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
        const url = `http://${settings.config.website.outerHostName}:${settings.config.website.port}${getDocument.url}?authentication_credential=${token}`;

        services.email.send(email, "your authentication credential", `you can click <a href='" + url + "'>${url}</a> to access the website`, next)
    });
}

export const getDocument:interfaces.ApiDocument = {
    name: "get authentication credential",
    url: "/api/authentication_credential.html",
    description: `will get authentication credential, and then store it to a cookie named '${services.cookieKey.authenticationCredential}', and then will redirect to home page`,
    method: "get",
    expirationDate: "no",
    versions: [{
        expirationDate: "no",
        parameters: {
            v: 1,
            token: {
                type: "string",
                required: true
            }
        },
        responseBody: {
            isSuccess: {
                type: "boolean"
            },
            statusCode: {
                type: "number"
            },
            errorCode: {
                type: "number"
            },
            errorMessage: {
                type: "string"
            }
        }
    }]
};

export function get(request:libs.Request, response:libs.Response) {
    const documentUrl = getDocument.documentUrl;

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

export function route(app:libs.Application) {
    app[createDocument.method](createDocument.url, create);
    services.response.notGet(app, createDocument);

    app[getDocument.method](getDocument.url, get);
}