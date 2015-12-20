import * as types from "../../types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfCreate: types.Document = {
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

    let body: Body = request.body;

    let clientId = libs.validator.trim(body.clientId);
    if (clientId === "") {
        throw services.error.fromParameterIsMissedMessage("clientId");
    }
    let clientSecret = libs.validator.trim(body.clientSecret);
    if (clientSecret === "") {
        throw services.error.fromParameterIsMissedMessage("clientSecret");
    }
    let state = libs.validator.trim(body.state);
    if (state === "") {
        throw services.error.fromParameterIsMissedMessage("state");
    }
    let code = libs.validator.trim(body.code);
    if (code === "") {
        throw services.error.fromParameterIsMissedMessage("code");
    }

    let value = await services.cache.getStringAsync(settings.cacheKeys.oauthLoginCode + code);
    if (!value) {
        throw services.error.fromMessage("code is invalid or expired", types.StatusCode.unauthorized);
    }

    let json: types.OAuthCodeValue = JSON.parse(value);

    if (state !== json.state) {
        throw services.error.fromMessage("state is invalid", types.StatusCode.unauthorized);
    }

    let application = await services.mongo.Application.findOne({
        clientId: clientId,
        clientSecret: clientSecret,
    }).exec();
    if (!application) {
        throw services.error.fromMessage("client id or client secret is invalid", types.StatusCode.unauthorized);
    }

    let creator = new libs.ObjectId(json.creator);

    let accessTokenValue = libs.generateUuid();
    let applicationId = new libs.ObjectId(json.application);

    // remove old access token, the old one may have smaller scopes
    await services.mongo.AccessToken.remove({
        creator: creator,
        application: applicationId,
    }).exec();

    let accessToken = await services.mongo.AccessToken.create({
        value: accessTokenValue,
        scopes: json.scopes,
        creator: creator,
        application: applicationId,
    });

    accessToken.save();

    services.logger.log(documentOfCreate.url, request);

    let result: types.GeneratedAccessTokenResult = {
        accessToken: accessTokenValue
    };
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}
