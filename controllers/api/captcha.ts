import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export const documentOfCreate: types.Document = {
    url: "/api/captchas",
    method: types.httpMethod.post,
    documentUrl: "/api/authentication/create an captcha.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: { id: string; } = request.body;

    const id = libs.validator.trim(body.id);

    if (id === "") {
        throw services.error.fromParameterIsMissedMessage("id");
    }

    const captcha = await services.captcha.create(id);

    const result: types.CaptchaResult = {
        url: captcha.url,
        code: settings.currentEnvironment === types.environment.test ? captcha.code : undefined,
    };
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}
