import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export const documentOfCreate: types.Document = {
    url: "/api/access_tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/create an access token for application.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    interface Body {
        clientId: string;
        clientSecret: string;
        state: string;
        code: string;
    }

    const body: Body = request.body;

    const clientId = typeof body.clientId === "string" ? libs.validator.trim(body.clientId) : "";
    if (clientId === "") {
        throw services.error.fromParameterIsMissedMessage("clientId");
    }
    const clientSecret = typeof body.clientSecret === "string" ? libs.validator.trim(body.clientSecret) : "";
    if (clientSecret === "") {
        throw services.error.fromParameterIsMissedMessage("clientSecret");
    }
    const state = typeof body.state === "string" ? libs.validator.trim(body.state) : "";
    if (state === "") {
        throw services.error.fromParameterIsMissedMessage("state");
    }
    const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
    if (code === "") {
        throw services.error.fromParameterIsMissedMessage("code");
    }

    const value = await services.redis.get(settings.cacheKeys.oauthLoginCode + code);
    if (!value) {
        throw services.error.fromMessage("code is invalid or expired", types.StatusCode.unauthorized);
    }

    const json: types.OAuthCodeValue = JSON.parse(value);

    if (state !== json.state) {
        throw services.error.fromMessage("state is invalid", types.StatusCode.unauthorized);
    }

    const application = await services.mongo.Application.findOne({
        clientId: clientId,
        clientSecret: clientSecret,
    }).exec();
    if (!application) {
        throw services.error.fromMessage("client id or client secret is invalid", types.StatusCode.unauthorized);
    }

    const creator = new libs.ObjectId(json.creator);

    const accessTokenValue = libs.generateUuid();
    const applicationId = new libs.ObjectId(json.application);

    // remove old access token, the old one may have smaller scopes
    await services.mongo.AccessToken.remove({
        creator: creator,
        application: applicationId,
    }).exec();

    const accessToken = await services.mongo.AccessToken.create({
        value: accessTokenValue,
        scopes: json.scopes,
        creator: creator,
        application: applicationId,
    });

    accessToken.save();

    services.logger.logRequest(documentOfCreate.url, request);

    const result: types.AccessTokenResult = {
        accessToken: accessTokenValue
    };
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}
