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
    libs.assert(clientId !== "", services.error.parameterIsMissed, "clientId");
    const clientSecret = typeof body.clientSecret === "string" ? libs.validator.trim(body.clientSecret) : "";
    libs.assert(clientSecret !== "", services.error.parameterIsMissed, "clientSecret");
    const state = typeof body.state === "string" ? libs.validator.trim(body.state) : "";
    libs.assert(state !== "", services.error.parameterIsMissed, "state");
    const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
    libs.assert(code !== "", services.error.parameterIsMissed, "code");

    const value = await services.redis.get(settings.cacheKeys.oauthLoginCode + code);
    libs.assert(value, services.error.parameterIsInvalid, "code");

    const json: types.OAuthCodeValue = JSON.parse(value);
    libs.assert(state === json.state, services.error.parameterIsInvalid, "state");

    const application = await services.mongo.Application.findOne({
        clientId: clientId,
        clientSecret: clientSecret,
    }).exec();
    libs.assert(application, services.error.parameterIsInvalid, "client id or client secret");

    const creator = new libs.ObjectId(json.creator);

    const accessTokenValue = libs.generateUuid();
    const applicationId = new libs.ObjectId(json.application);

    // remove old access token, the old one may have smaller scopes
    await services.mongo.AccessToken.remove({
        creator,
        application: applicationId,
    }).exec();

    const accessToken = await services.mongo.AccessToken.create({
        value: accessTokenValue,
        scopes: json.scopes,
        creator,
        application: applicationId,
    });

    accessToken.save();

    services.logger.logRequest(documentOfCreate.url, request);

    const result: types.AccessTokenResult = {
        accessToken: accessTokenValue,
    };
    services.response.sendSuccess(response, result);
}
