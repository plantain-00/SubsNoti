import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
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

    if (typeof body.email !== "string"
        || !libs.validator.isEmail(body.email)) {
        throw services.error.fromParameterIsInvalidMessage("email");
    }

    const email = typeof body.email === "string" ? libs.validator.trim(body.email).toLowerCase() : "";
    const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
    const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
    const guid = typeof body.guid === "string" ? libs.validator.trim(body.guid) : "";
    const redirectUrl = typeof body.redirectUrl === "string" ? libs.validator.trim(body.redirectUrl) : "";
    if (code === "" || guid === "") {
        throw services.error.fromParameterIsInvalidMessage("code or guid");
    }

    await services.captcha.validate(guid, code);

    const token = await services.tokens.create(email, documentOfCreate.url, request, name);

    const url = `${settings.api}${settings.urls.login}?` + libs.qs.stringify({
        authentication_credential: token,
        redirect_url: redirectUrl,
    });

    let result: types.TokenResult;
    if (settings.currentEnvironment === types.environment.test) {
        result = {
            url: url,
        };
    } else {
        await services.email.sendAsync(email, "your token", `you can click <a href='${url}'>${url}</a> to access the website`);
        result = {};
    }
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}
