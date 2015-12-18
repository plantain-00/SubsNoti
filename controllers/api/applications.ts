import * as types from "../../types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/applications/:id",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get an application.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        let params: { id: string; } = request.params;

        if (!libs.validator.isMongoId(params.id)) {
            throw services.error.fromParameterIsInvalidMessage("id");
        }

        let id = new libs.ObjectId(params.id);

        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);

        let application = await services.mongo.Application.findOne({ _id: id })
            .populate("creator")
            .exec();

        if (!application) {
            throw services.error.fromParameterIsInvalidMessage("id");
        }

        let creator = <services.mongo.UserDocument>application.creator;
        let creatorId = creator._id.toHexString();
        let result: types.ApplicationResult = {
            application: {
                id: application._id.toHexString(),
                name: application.name,
                homeUrl: application.homeUrl,
                description: application.description,
                creator: {
                    id: creatorId,
                    name: creator.name,
                    avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
                },
            },
        };

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
