import * as types from "../../share/types";
import * as libs from "../../libs";
import * as services from "../../services";

export const documentOfGet: types.Document = {
    url: "/api/applications/:id",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get an application.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    const params: { id: string; } = request.params;
    libs.assert(typeof params.id === "string" && libs.validator.isMongoId(params.id), services.error.parameterIsInvalid, "id");

    const id = new libs.ObjectId(params.id);
    const application = await services.mongo.Application.findOne({ _id: id })
        .populate("creator")
        .exec();
    libs.assert(application, services.error.parameterIsInvalid, "id");

    const creator = application.creator as services.mongo.UserDocument;
    const creatorId = creator._id.toHexString();
    const result: types.ApplicationResult = {
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

    services.response.sendSuccess(response, result);
}
