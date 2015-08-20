import libs = require("../libs");
import settings = require("../settings");
import enums = require("../enums/enums");
import interfaces = require("../interfaces/interfaces");
import services = require("../services/services");

export const createDocument:interfaces.ApiDocument = {
    name: "create a token for a given email",
    url: "/api/token",
    description: "will send a link with it to the given email",
    method: "POST",
    expirationDate: "no",
    contentType: "application/json",
    parameters: {
        v: {
            type: "number",
            description: "no v means the newest version"
        }
    },
    versions: {
        1: {
            expirationDate: "no",
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
        }
    }
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
            services.response.send(response, error.message, enums.ErrorCode.dbAccessError, enums.StatusCode.internalServerError, documentUrl);
            return;
        }

        if (rows.length == 0) {
            var salt = libs.generateUuid();
            services.db.access("insert into users (EmailHead,EmailTail,Name,Salt,Status) values(?,?,?,?,?)", [emailHead, emailTail, name, salt, enums.UserStatus.normal], (error, rows)=> {
                if (error) {
                    services.response.send(response, error.message, enums.ErrorCode.dbAccessError, enums.StatusCode.internalServerError, documentUrl);
                    return;
                }

                const id = rows.insertId;

                sendEmail(id, salt, emailHead + "@" + emailTail, error=> {
                    if (error) {
                        services.response.send(response, error.message, enums.ErrorCode.emailServiceError, enums.StatusCode.internalServerError, documentUrl);
                        return;
                    }

                    services.response.send(response, "", enums.ErrorCode.success, enums.StatusCode.createdOrModified, documentUrl);
                });
            });
        } else if (rows.length == 1) {
            var user = new interfaces.User(rows[0]);

            sendEmail(user.id, user.salt, user.getEmail(), error=> {
                if (error) {
                    services.response.send(response, error.message, enums.ErrorCode.emailServiceError, enums.StatusCode.internalServerError, documentUrl);
                    return;
                }

                services.response.send(response, "", enums.ErrorCode.success, enums.StatusCode.createdOrModified, documentUrl);
            });
        } else {
            services.response.send(response, "the account is in wrong status now", enums.ErrorCode.accountInWrongStatus, enums.StatusCode.unprocessableEntity, documentUrl);
        }
    });
}

function sendEmail(userId:number, salt:string, email:string, next:(error:Error)=>void) {
    var tmp = services.token.generate(salt + userId);
    var token = tmp.result + "g" + tmp.milliseconds + "g" + userId.toString(16);

    services.email.send(email, "your token", "you can click " + token + " to access the website", next)
}