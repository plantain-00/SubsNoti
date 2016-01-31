import * as types from "../../../../share/types";
import * as libs from "../../../../libs";
import * as settings from "../../../../settings";
import * as services from "../../../../services";

export const documentOfReset: types.Document = {
    url: "/api/user/registered/:application_id/client_secret",
    method: types.httpMethod.put,
    documentUrl: "/api/application/reset client secret.html",
};

export async function reset(request: libs.Request, response: libs.Response) {
    interface Params {
        application_id: string;
    }

    const params: Params = request.params;

    if (!libs.validator.isMongoId(params.application_id)) {
        throw services.error.fromParameterIsInvalidMessage("application_id");
    }

    const id = new libs.ObjectId(params.application_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);

    // the application should be available.
    const application = await services.mongo.Application.findOne({ _id: id })
        .exec();
    if (!application) {
        throw services.error.fromParameterIsInvalidMessage("application_id");
    }

    application.clientSecret = libs.generateUuid();

    application.save();

    services.logger.logRequest(documentOfReset.url, request);
    services.response.sendSuccess(response, types.StatusCode.createdOrModified);
}
