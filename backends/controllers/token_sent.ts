import * as libs from "../libs";
import * as settings from "../settings";

import * as enums from "../../common/enums";
import * as interfaces from "../../common/interfaces";

import * as services from "../services";

let documentOfCreate = {
    url: "/api/token_sent",
    method: "post",
    documentUrl: "/doc/api/Send token via email.html"
};

export function create(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfCreate.documentUrl;

    if (services.contentType.isNotJson(request)) {
        services.response.sendContentTypeError(response, documentUrl);
        return;
    }

    let emailHead: string = request.body.emailHead;
    let emailTail: string = request.body.emailTail;
    let name = request.body.name;

    if (!emailHead || !emailTail) {
        services.response.sendParameterMissedError(response, documentUrl);
        return;
    }

    emailHead = emailHead.toLowerCase();
    emailTail = emailTail.toLowerCase();

    services.user.getByEmail(emailHead, emailTail).then(user=> {
        if (user) {
            return sendEmail(user.id, user.salt, services.user.getEmail(user)).then(() => {
                services.response.sendCreatedOrModified(response, documentUrl);
            }, error=> {
                services.response.sendEmailServiceError(response, error.message, documentUrl);
            });
        } else {
            let salt = libs.generateUuid();
            services.db.accessAsync("insert into users (EmailHead,EmailTail,Name,Salt,Status) values(?,?,?,?,?)", [emailHead, emailTail, name, salt, enums.UserStatus.normal]).then(rows=> {
                let id = rows.insertId;

                return sendEmail(id, salt, `${emailHead}@${emailTail}`).then(() => {
                    services.logger.log(documentOfCreate.url, request);
                    services.response.sendCreatedOrModified(response, documentUrl);
                }, error=> {
                    services.response.sendEmailServiceError(response, error.message, documentUrl);
                });
            }, error=> {
                services.response.sendDBAccessError(response, error.message, documentUrl);
            });
        }
    }, error=> {
        services.response.sendDBAccessError(response, error.message, documentUrl);
    });
}

function sendEmail(userId: number, salt: string, email: string): libs.Promise<{}> {
    return services.frequency.limit(email, 60 * 60).then(() => {
        let token = services.authenticationCredential.create(userId, salt);
        let url = `http://${settings.config.website.outerHostName}:${settings.config.website.port}${settings.config.urls.login}?authentication_credential=${token}`;

        return services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);
    });
}

export function route(app: libs.Application) {
    app[documentOfCreate.method](documentOfCreate.url, create);
    services.response.notGet(app, documentOfCreate);
}