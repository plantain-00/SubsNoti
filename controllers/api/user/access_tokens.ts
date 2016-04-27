import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

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
                scopes: settings.scopes.filter(s => a.scopes.some(sc => sc === s.name)),
                lastUsed: a.lastUsed ? a.lastUsed.toISOString() : null,
            };
        }),
    };

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}

interface Body {
    description: string;
    scopes: string[];
}

export const documentOfCreate: types.Document = {
    url: "/api/user/access_tokens",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/create an access token.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: Body = request.body;

    let description = "";
    if (typeof body.description === "string") {
        description = libs.validator.trim(body.description);
    }
    if (description === "") {
        throw services.error.fromParameterIsMissedMessage("description");
    }

    const scopes = body.scopes;

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    const value = libs.generateUuid();
    const accessToken = await services.mongo.AccessToken.create({
        description: description,
        value: value,
        scopes: scopes,
        creator: request.userId,
    });

    accessToken.save();

    services.logger.logRequest(documentOfCreate.url, request);

    const result: types.AccessTokenResult = {
        accessToken: value,
    };
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}

export const documentOfUpdate: types.Document = {
    url: "/api/user/access_tokens/:access_token_id",
    method: types.httpMethod.put,
    documentUrl: "/api/access token/update an access token.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    const params: { access_token_id: string; } = request.params;

    if (typeof params.access_token_id !== "string"
        || !libs.validator.isMongoId(params.access_token_id)) {
        throw services.error.fromParameterIsInvalidMessage("access_token_id");
    }

    const body: Body = request.body;

    let description = libs.validator.trim(body.description);
    if (typeof body.description === "string") {
        description = libs.validator.trim(body.description);
    }
    if (description === "") {
        throw services.error.fromParameterIsMissedMessage("description");
    }

    const scopes = body.scopes;

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    const id = new libs.ObjectId(params.access_token_id);

    // the sccess token should be available.
    const accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
        .exec();
    if (!accessToken) {
        throw services.error.fromParameterIsInvalidMessage("access_token_id");
    }

    accessToken.description = description;
    accessToken.scopes = scopes;

    accessToken.save();

    services.logger.logRequest(documentOfUpdate.url, request);
    services.response.sendSuccess(response, types.StatusCode.createdOrModified);
}

export const documentOfRemove: types.Document = {
    url: "/api/user/access_tokens/:access_token_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/access token/delete an access token.html",
};

export async function remove(request: libs.Request, response: libs.Response) {
    const params: { access_token_id: string; } = request.params;

    if (typeof params.access_token_id !== "string"
        || !libs.validator.isMongoId(params.access_token_id)) {
        throw services.error.fromParameterIsInvalidMessage("access_token_id");
    }

    const id = new libs.ObjectId(params.access_token_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.deleteAccessToken);

    // the access token should be available.
    const accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
        .exec();
    if (!accessToken) {
        throw services.error.fromParameterIsInvalidMessage("access_token_id");
    }

    accessToken.remove();

    services.logger.logRequest(documentOfRemove.url, request);
    services.response.sendSuccess(response, types.StatusCode.deleted);
}
