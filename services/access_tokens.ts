import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export const documentOfRegenerate: types.Document = {
    url: "/api/user/access_tokens/:access_token_id/value",
    method: types.httpMethod.put,
    documentUrl: "/api/access token/update an access token.html",
};

export async function regenerate(request: libs.Request, response: libs.Response) {
    const params: { access_token_id: string; } = request.params;
    services.utils.assert(typeof params.access_token_id === "string" && libs.validator.isMongoId(params.access_token_id), services.error.parameterIsInvalid, "access_token_id");

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    const id = new libs.mongoose.Types.ObjectId(params.access_token_id);

    // the sccess token should be available.
    const accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
        .exec();
    services.utils.assert(accessToken, services.error.parameterIsInvalid, "access_token_id");

    accessToken.value = services.utils.generateUuid();

    accessToken.save();

    const result: types.AccessTokenResult = {
        accessToken: accessToken.value,
    };
    services.response.sendSuccess(response, result);
}

export const documentOfConfirm: types.Document = {
    url: "/api/user/access_tokens/:code",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/confirm.html",
};

export async function confirm(request: libs.Request, response: libs.Response) {
    const code: string = request.params.code;

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    const value = await services.redis.get(services.settings.cacheKeys.oauthLoginCode + code);
    const json: types.OAuthCodeValue = JSON.parse(value);

    json.confirmed = true;

    services.redis.set(services.settings.cacheKeys.oauthLoginCode + code, JSON.stringify(json));

    services.response.sendSuccess(response);
};

export const documentOfGet: types.Document = {
    url: "/api/user/access_tokens",
    method: types.httpMethod.get,
    documentUrl: "/api/access token/get access tokens.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    services.scope.shouldValidateAndContainScope(request, types.scopeNames.readAccessToken);

    const accessTokens = await services.mongo.AccessToken.find({ application: null, creator: request.userId })
        .exec();

    const result: types.AccessTokensResult = {
        accessTokens: accessTokens.map(a => {
            return {
                id: a._id.toHexString(),
                description: a.description,
                scopes: services.settings.scopes.filter(s => a.scopes.some(sc => sc === s.name)),
                lastUsed: a.lastUsed ? a.lastUsed.toISOString() : undefined,
            };
        }),
    };

    services.response.sendSuccess(response, result);
}

export const documentOfCreate: types.Document = {
    url: "/api/user/access_tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/create an access token.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: {
        description: string;
        scopes: string[];
    } = request.body;

    let description = "";
    if (typeof body.description === "string") {
        description = libs.validator.trim(body.description);
    }
    services.utils.assert(description !== "", services.error.parameterIsMissed, "description");

    const scopes = body.scopes;

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    const value = services.utils.generateUuid();
    const accessToken = await services.mongo.AccessToken.create({
        description,
        value,
        scopes,
        creator: request.userId,
    });

    accessToken.save();

    services.logger.logRequest(documentOfCreate.url, request);

    const result: types.AccessTokenResult = {
        accessToken: value,
    };
    services.response.sendSuccess(response, result);
}

export const documentOfUpdate: types.Document = {
    url: "/api/user/access_tokens/:access_token_id",
    method: types.httpMethod.put,
    documentUrl: "/api/access token/update an access token.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    const params: { access_token_id: string; } = request.params;
    services.utils.assert(typeof params.access_token_id === "string" && libs.validator.isMongoId(params.access_token_id), services.error.parameterIsInvalid, "access_token_id");

    const body: {
        description: string;
        scopes: string[];
    } = request.body;

    let description = libs.validator.trim(body.description);
    if (typeof body.description === "string") {
        description = libs.validator.trim(body.description);
    }
    services.utils.assert(description !== "", services.error.parameterIsInvalid, "description");

    const scopes = body.scopes;

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    const id = new libs.mongoose.Types.ObjectId(params.access_token_id);

    // the sccess token should be available.
    const accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
        .exec();
    services.utils.assert(accessToken, services.error.parameterIsInvalid, "access_token_id");

    accessToken.description = description;
    accessToken.scopes = scopes;

    accessToken.save();

    services.logger.logRequest(documentOfUpdate.url, request);
    services.response.sendSuccess(response);
}

export const documentOfRemove: types.Document = {
    url: "/api/user/access_tokens/:access_token_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/access token/delete an access token.html",
};

export async function remove(request: libs.Request, response: libs.Response) {
    const params: { access_token_id: string; } = request.params;
    services.utils.assert(typeof params.access_token_id === "string" && libs.validator.isMongoId(params.access_token_id), services.error.parameterIsInvalid, "access_token_id");

    const id = new libs.mongoose.Types.ObjectId(params.access_token_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.deleteAccessToken);

    // the access token should be available.
    const accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
        .exec();
    services.utils.assert(accessToken, services.error.parameterIsInvalid, "access_token_id");

    accessToken.remove();

    services.logger.logRequest(documentOfRemove.url, request);
    services.response.sendSuccess(response);
}

export const documentOfCreateForApplication: types.Document = {
    url: "/api/access_tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/create an access token for application.html",
};

export async function createForApplication(request: libs.Request, response: libs.Response) {
    const body: {
        clientId: string;
        clientSecret: string;
        state: string;
        code: string;
    } = request.body;

    const clientId = typeof body.clientId === "string" ? libs.validator.trim(body.clientId) : "";
    services.utils.assert(clientId !== "", services.error.parameterIsMissed, "clientId");
    const clientSecret = typeof body.clientSecret === "string" ? libs.validator.trim(body.clientSecret) : "";
    services.utils.assert(clientSecret !== "", services.error.parameterIsMissed, "clientSecret");
    const state = typeof body.state === "string" ? libs.validator.trim(body.state) : "";
    services.utils.assert(state !== "", services.error.parameterIsMissed, "state");
    const code = typeof body.code === "string" ? libs.validator.trim(body.code) : "";
    services.utils.assert(code !== "", services.error.parameterIsMissed, "code");

    const value = await services.redis.get(services.settings.cacheKeys.oauthLoginCode + code);
    services.utils.assert(value, services.error.parameterIsInvalid, "code");

    const json: types.OAuthCodeValue = JSON.parse(value);
    services.utils.assert(state === json.state, services.error.parameterIsInvalid, "state");

    const application = await services.mongo.Application.findOne({
        clientId: clientId,
        clientSecret: clientSecret,
    }).exec();
    services.utils.assert(application, services.error.parameterIsInvalid, "client id or client secret");

    const creator = new libs.mongoose.Types.ObjectId(json.creator);

    const accessTokenValue = services.utils.generateUuid();
    const applicationId = new libs.mongoose.Types.ObjectId(json.application);

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
