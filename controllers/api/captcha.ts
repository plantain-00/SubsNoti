import * as types from "../../share/types";
import * as libs from "../../libs";
import * as services from "../../services";

export const documentOfCreate: types.Document = {
    url: "/api/captchas",
    method: types.httpMethod.post,
    documentUrl: "/api/authentication/create an captcha.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: { id: string; } = request.body;

    const id = typeof body.id === "string" ? libs.validator.trim(body.id) : "";
    libs.assert(id !== "", services.error.parameterIsMissed, "id");

    const captcha = await services.captcha.create(id);

    const result: types.CaptchaResult = {
        url: captcha.url,
        code: services.settings.currentEnvironment === types.environment.test ? captcha.code : undefined,
    };
    services.response.sendSuccess(response, result);
}
