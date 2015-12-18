import * as types from "../../../../types";
import * as libs from "../../../../libs";
import * as settings from "../../../../settings";
import * as services from "../../../../services";

export let documentOfConfirm: types.Document = {
    url: "/api/user/access_tokens/:code",
    method: types.httpMethod.post,
    documentUrl: "/api/access token/confirm.html",
};

export async function confirm(request: libs.Request, response: libs.Response) {
    try {
        let code: string = request.params.code;

        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

        let value = await services.cache.getStringAsync(settings.cacheKeys.oauthLoginCode + code);
        let json: types.OAuthCodeValue = JSON.parse(value);

        json.confirmed = true;

        services.cache.setString(settings.cacheKeys.oauthLoginCode + code, JSON.stringify(json));

        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
};
