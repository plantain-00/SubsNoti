import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

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

export const documentOfCreate: types.Document = {
    url: "/api/tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/authentication/send token via email.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: {
        email: string;
        name: string;
        code: string;
        guid: string;
        redirectUrl: string;
    } = request.body;
    services.utils.assert(typeof body.email === "string" && libs.validator.isEmail(body.email), services.error.parameterIsInvalid, "email");

    const email = typeof body.email === "string" ? libs.validator.trim(body.email).toLowerCase() : "";
    const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
    const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
    const guid = typeof body.guid === "string" ? libs.validator.trim(body.guid) : "";
    const redirectUrl = typeof body.redirectUrl === "string" ? libs.validator.trim(body.redirectUrl) : "";
    services.utils.assert(code !== "", services.error.parameterIsInvalid, "code");
    services.utils.assert(guid !== "", services.error.parameterIsInvalid, "guid");

    await services.captcha.validate(guid, code);

    const token = await createInternally(email, documentOfCreate.url, request, name);

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

export async function createInternally(email: string, url: string, request: libs.Request, name: string): Promise<string> {
    if (!libs.validator.isEmail(email)) {
        return Promise.reject<string>(libs.util.format(services.error.parameterIsInvalid, "email"));
    }

    email = libs.validator.trim(email).toLowerCase();

    // find out if the email is someone's. if no, create an account.
    let user = await services.mongo.User.findOne({ email })
        .exec();
    if (!user) {
        const salt = services.utils.generateUuid();
        user = await services.mongo.User.create({
            email,
            name,
            salt,
            status: types.UserStatus.normal,
        });
        await services.avatar.createIfNotExistsAsync(user._id.toHexString());

        services.logger.logRequest(url, request);
    }

    await services.frequency.limitEmail(email);

    const token = services.authenticationCredential.create(user._id.toHexString(), user.salt);

    return token;
}
