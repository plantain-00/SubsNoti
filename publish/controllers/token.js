var libs = require("../libs");
var settings = require("../settings");
var enums = require("../enums/enums");
var interfaces = require("../interfaces/interfaces");
var services = require("../services/services");
exports.generateDocument = {
    name: "get a token for a given email",
    url: "/api/token/generate",
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
function generate(request, response) {
    var documentUrl = exports.generateDocument.documentUrl;
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
    services.db.access("select * from users where EmailHead = ? and EmailTail = ?", [emailHead, emailTail], function (error, rows) {
        if (error) {
            services.response.sendDBAccessError(response, error.message, documentUrl);
            return;
        }
        if (rows.length == 0) {
            var salt = libs.generateUuid();
            services.db.access("insert into users (EmailHead,EmailTail,Name,Salt,Status) values(?,?,?,?,?)", [emailHead, emailTail, name, salt, 0 /* normal */], function (error, rows) {
                if (error) {
                    services.response.sendDBAccessError(response, error.message, documentUrl);
                    return;
                }
                var id = rows.insertId;
                sendEmail(id, salt, emailHead + "@" + emailTail, function (error) {
                    if (error) {
                        services.response.sendEmailServiceError(response, error.message, documentUrl);
                        return;
                    }
                    services.response.sendCreatedOrModified(response, documentUrl);
                });
            });
        }
        else if (rows.length == 1) {
            var user = new interfaces.User(rows[0]);
            sendEmail(user.id, user.salt, user.getEmail(), function (error) {
                if (error) {
                    services.response.sendEmailServiceError(response, error.message, documentUrl);
                    return;
                }
                services.response.sendCreatedOrModified(response, documentUrl);
            });
        }
        else {
            services.response.sendAccountInWrongStatusError(response, "the account is in wrong status now", documentUrl);
        }
    });
}
exports.generate = generate;
function sendEmail(userId, salt, email, next) {
    var token = services.token.generate(userId, salt);
    services.email.send(email, "your token", "you can click http://" + settings.config.website.outerHostName + ":" + settings.config.website.port + exports.acceptDocument.url + "?token=" + token + " to access the website", next);
}
exports.acceptDocument = {
    name: "accept a token",
    url: "/api/token/accept",
    description: "will store it to cookie named 'token', and will redirect to home page",
    method: "GET",
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
function accept(request, response) {
    var documentUrl = exports.acceptDocument.documentUrl;
    var token = request.query.token;
    if (!token) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }
    response.cookie("token", token, {
        expires: libs.moment().clone().add(1, "months").toDate(),
        httpOnly: true
    });
    response.redirect("/index.html");
}
exports.accept = accept;
exports.validateDocument = {
    name: "validate whether current user is verified",
    url: "/api/token/validate",
    description: "the token should be stored in a cookie named 'token'",
    method: "GET",
    expirationDate: "no",
    versions: [{
            expirationDate: "no",
            parameters: {
                v: 1
            },
            cookieNames: {
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
function validate(request, response) {
    var documentUrl = exports.validateDocument.documentUrl;
    var token = request.cookies["token"];
    if (!token) {
        services.response.sendUnauthorizedError(response, "cookie is expired", documentUrl);
        return;
    }
    services.token.validate(token, function (error) {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }
        services.response.sendOK(response, documentUrl);
    });
}
exports.validate = validate;
//# sourceMappingURL=token.js.map