import * as types from "../../../../share/types";
import * as libs from "../../../../libs";
import * as settings from "../../../../settings";
import * as services from "../../../../services";

export const documentOfConfirm: types.Document = {
    url: "/api/user/access_tokens/:code",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/confirm.html",
};

export async function confirm(request: libs.Request, response: libs.Response) {
    const code: string = request.params.code;

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    const value = await services.cache.client.get(settings.cacheKeys.oauthLoginCode + code);
    const json: types.OAuthCodeValue = JSON.parse(value);

    json.confirmed = true;

    services.cache.client.set(settings.cacheKeys.oauthLoginCode + code, JSON.stringify(json));

    services.response.sendSuccess(response, types.StatusCode.createdOrModified);
};
