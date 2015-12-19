import * as types from "../../../types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfDelete: types.Document = {
    url: "/api/user/logged_in",
    method: types.httpMethod.delete,
    documentUrl: "/api/authentication/log out.html",
};

export function deleteThis(request: libs.Request, response: libs.Response): void {
    response.clearCookie(settings.cookieKeys.authenticationCredential);

    services.response.sendSuccess(response, types.StatusCode.deleted);
}
