import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as services from "../../../services";

export const documentOfDelete: types.Document = {
    url: "/api/user/logged_in",
    method: types.httpMethod.delete,
    documentUrl: "/api/authentication/log out.html",
};

export async function deleteThis(request: libs.Request, response: libs.Response) {
    response.clearCookie(services.settings.cookieKeys.authenticationCredential, {
        domain: services.settings.cookieDomains,
    });

    services.response.sendSuccess(response);
}
