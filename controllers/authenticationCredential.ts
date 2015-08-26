import libs = require("../libs");
import settings = require("../settings");

import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import models = require("../models/models");

import services = require("../services/services");

export const createDocument:interfaces.ApiDocument = {
    name: "get a authentication credential for a given email",
    url: "/api/authentication_credential",
    description: "will send a link with it to the given email",
    method: "POST",
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
    var documentUrl = createDocument.documentUrl;

    if (services.contentType.isNotJson(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    var emailHead = request.body.emailHead;
    var emailTail = request.body.emailTail;
    var name = request.body.name;

    if (!emailHead || !emailTail) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    services.db.access("select * from users where EmailHead = ? and EmailTail = ?", [emailHead, emailTail], (error, rows)=> {
        if (error) {
            services.response.sendDBAccessError(response, error.message, documentUrl);
            return;
        }

        if (rows.length == 0) {
            var salt = libs.generateUuid();
            services.db.access("insert into users (EmailHead,EmailTail,Name,Salt,Status) values(?,?,?,?,?)", [emailHead, emailTail, name, salt, enums.UserStatus.normal], (error, rows)=> {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }

                const id = rows.insertId;

                sendEmail(id, salt, emailHead + "@" + emailTail, error=> {
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
            var user = new models.User(rows[0]);

            sendEmail(user.id, user.salt, user.getEmail(), error=> {
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

        var token = services.authenticationCredential.create(userId, salt);

        services.email.send(email, "your authentication credential", "you can click http://" + settings.config.website.outerHostName + ":" + settings.config.website.port + updateDocument.url + "?authentication_credential=" + token + " to access the website", next)
    });
}

export const updateDocument:interfaces.ApiDocument = {
    name: "update a authentication credential",
    url: "/api/authentication_credential",
    description: "will update the cookie named '" + services.cookieKey.authenticationCredential + "', and then will redirect to home page",
    method: "PUT",
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

export function update(request:libs.Request, response:libs.Response) {
    var documentUrl = updateDocument.documentUrl;

    var authenticationCredential = request.query.authentication_credential;

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