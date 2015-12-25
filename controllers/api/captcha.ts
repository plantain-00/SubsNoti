import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
    url: "/api/captchas",
    method: types.httpMethod.post,
    documentUrl: "/api/authentication/create an captcha.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    let body: { id: string; } = request.body;

    let id = libs.validator.trim(body.id);

    if (id === "") {
        throw services.error.fromParameterIsMissedMessage("id");
    }

    let captcha = await services.captcha.create(id);

    let result: types.CaptchaResult = {
        url: captcha.url,
        code: settings.currentEnvironment === types.environment.test ? captcha.code : undefined,
    };
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}
