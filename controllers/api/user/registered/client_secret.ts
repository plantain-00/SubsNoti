import * as types from "../../../../types";
import * as libs from "../../../../libs";
import * as settings from "../../../../settings";
import * as services from "../../../../services";

export let documentOfReset: types.Document = {
    url: "/api/user/registered/:application_id/client_secret",
    method: "put",
    documentUrl: "/api/application/reset client secret.html",
};

export async function reset(request: libs.Request, response: libs.Response) {
    try {
        interface Params {
            application_id: string;
        }

        let params: Params = request.params;

        if (!libs.validator.isMongoId(params.application_id)) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }

        let id = new libs.ObjectId(params.application_id);

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        // the application should be available.
        let application = await services.mongo.Application.findOne({ _id: id })
            .exec();
        if (!application) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }

        application.clientSecret = libs.generateUuid();

        application.save();

        services.logger.log(documentOfReset.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
