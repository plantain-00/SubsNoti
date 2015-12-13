"use strict";

import * as types from "../../../types";

import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/access_tokens",
    method: "get",
    documentUrl: "/api/access token/get access tokens.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        let accessTokens = await services.mongo.AccessToken.find({ application: null })
            .exec();

        let result: types.AccessTokenResult = {
            accessTokens: libs._.map(accessTokens, a => {
                return {
                    id: a._id.toHexString(),
                    description: a.description,
                    scopes: libs._.filter(settings.scopes, s => libs._.any(a.scopes, sc => sc === s.name)),
                };
            }),
        };

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

interface Body {
    description: string;
    scopes: string[];
}

export let documentOfCreate: types.Document = {
    url: "/api/user/access_tokens",
    method: "post",
    documentUrl: "/api/access token/create an access token.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    try {
        let body: Body = request.body;

        let description = libs.validator.trim(body.description);
        if (description === "") {
            throw services.error.fromParameterIsMissedMessage("description");
        }

        let scopes = body.scopes;

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        let value = libs.generateUuid();
        let accessToken = await services.mongo.AccessToken.create({
            description: description,
            value: value,
            scopes: scopes,
            creator: request.userId,
        });

        accessToken.save();

        services.logger.log(documentOfCreate.url, request);

        let result: types.GeneratedAccessTokenResult = {
            accessToken: value
        };
        services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfUpdate: types.Document = {
    url: "/api/user/access_tokens/:access_token_id",
    method: "put",
    documentUrl: "/api/access token/update an access token.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    try {
        let params: { access_token_id: string; } = request.params;

        if (!libs.validator.isMongoId(params.access_token_id)) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }

        let body: Body = request.body;

        let description = libs.validator.trim(body.description);
        if (description === "") {
            throw services.error.fromParameterIsMissedMessage("description");
        }

        let scopes = body.scopes;

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        let id = new libs.ObjectId(params.access_token_id);

        // the sccess token should be available.
        let accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
            .exec();
        if (!accessToken) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }

        accessToken.description = description;
        accessToken.scopes = scopes;

        accessToken.save();

        services.logger.log(documentOfUpdate.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfRemove: types.Document = {
    url: "/api/user/access_tokens/:access_token_id",
    method: "delete",
    documentUrl: "/api/access token/delete an access token.html",
};

export async function remove(request: libs.Request, response: libs.Response) {
    try {
        let params: { access_token_id: string; } = request.params;

        if (!libs.validator.isMongoId(params.access_token_id)) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }

        let id = new libs.ObjectId(params.access_token_id);

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        // the access token should be available.
        let accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
            .exec();
        if (!accessToken) {
            throw services.error.fromParameterIsInvalidMessage("access_token_id");
        }

        accessToken.remove();

        services.logger.log(documentOfRemove.url, request);
        services.response.sendSuccess(response, types.StatusCode.deleted);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
