import * as types from "../../types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
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

    let body: Body = request.body;

    if (!libs.validator.isEmail(body.email)) {
        throw services.error.fromParameterIsInvalidMessage("email");
    }

    let email = libs.validator.trim(body.email).toLowerCase();
    let name = libs.validator.trim(body.name);
    let code = libs.validator.trim(body.code);
    let guid = libs.validator.trim(body.guid);
    let redirectUrl = libs.validator.trim(body.redirectUrl);
    if (code === "" || guid === "") {
        throw services.error.fromParameterIsInvalidMessage("code or guid");
    }

    await services.captcha.validate(guid, code);

    let token = await services.tokens.create(email, documentOfCreate.url, request, name);

    let url = `${settings.api.get(settings.currentEnvironment)}${settings.urls.login}?` + libs.qs.stringify({
        authentication_credential: token,
        redirect_url: redirectUrl,
    });

    let result: types.TokenResult;
    if (settings.currentEnvironment === types.environment.test) {
        result = {
            url: url
        };
    } else {
        await services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);
        result = {};
    }
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}
