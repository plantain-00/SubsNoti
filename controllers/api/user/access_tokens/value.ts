import * as types from "../../../../types";
import * as libs from "../../../../libs";
import * as settings from "../../../../settings";
import * as services from "../../../../services";

export let documentOfRegenerate: types.Document = {
    url: "/api/user/access_tokens/:access_token_id/value",
    method: types.httpMethod.put,
    documentUrl: "/api/access token/update an access token.html",
};

export async function regenerate(request: libs.Request, response: libs.Response) {
    let params: { access_token_id: string; } = request.params;

    if (!libs.validator.isMongoId(params.access_token_id)) {
        throw services.error.fromParameterIsInvalidMessage("access_token_id");
    }

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeAccessToken);

    let id = new libs.ObjectId(params.access_token_id);

    // the sccess token should be available.
    let accessToken = await services.mongo.AccessToken.findOne({ _id: id, application: null })
        .exec();
    if (!accessToken) {
        throw services.error.fromParameterIsInvalidMessage("access_token_id");
    }

    accessToken.value = libs.generateUuid();

    accessToken.save();

    let result: types.GeneratedAccessTokenResult = {
        accessToken: accessToken.value
    };
    services.response.sendSuccess(response, types.StatusCode.createdOrModified, result);
}
