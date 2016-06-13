import * as types from "../../share/types";
import * as libs from "../../libs";
import * as services from "../../services";

export const documentOfCreate: types.Document = {
    url: "/api/tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/authentication/send token via email.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    interface Body {
        email: string;
        name: string;
        code: string;
        guid: string;
        redirectUrl: string;
    }

    const body: Body = request.body;
    services.utils.assert(typeof body.email === "string" && libs.validator.isEmail(body.email), services.error.parameterIsInvalid, "email");

    const email = typeof body.email === "string" ? libs.validator.trim(body.email).toLowerCase() : "";
    const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
    const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
    const guid = typeof body.guid === "string" ? libs.validator.trim(body.guid) : "";
    const redirectUrl = typeof body.redirectUrl === "string" ? libs.validator.trim(body.redirectUrl) : "";
    services.utils.assert(code !== "", services.error.parameterIsInvalid, "code");
    services.utils.assert(guid !== "", services.error.parameterIsInvalid, "guid");

    await services.captcha.validate(guid, code);

    const token = await services.tokens.create(email, documentOfCreate.url, request, name);

    const url = `${services.settings.api}${services.settings.urls.login}?` + libs.qs.stringify({
        authentication_credential: token,
        redirect_url: redirectUrl,
    });

    let result: types.TokenResult;
    if (services.settings.currentEnvironment === types.environment.test) {
        result = { url };
    } else {
        await services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);
        result = {};
    }
    services.response.sendSuccess(response, result);
}
