import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/authorized",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get authorized applications.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);

    let accessTokens = await services.mongo.AccessToken.find({ creator: request.userId })
        .populate("application")
        .exec();

    for (let accessToken of accessTokens) {
        await services.mongo.User.populate(accessToken.application, "creator");
    }

    let result: types.ApplicationsResult = {
        applications: accessTokens.filter(ac => !!ac.application).map(ac => {
            let a = ac.application as services.mongo.ApplicationDocument;
            let creator = a.creator as services.mongo.UserDocument;
            let creatorId = creator._id.toHexString();
            return {
                id: a._id.toHexString(),
                name: a.name,
                homeUrl: a.homeUrl,
                description: a.description,
                creator: {
                    id: creatorId,
                    name: creator.name,
                    avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
                },
                scopes: settings.scopes.filter(s => ac.scopes.some(sc => sc === s.name)),
                lastUsed: ac.lastUsed ? ac.lastUsed.toISOString() : null,
            };
        }),
    };

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}

export let documentOfRemove: types.Document = {
    url: "/api/user/authorized/:application_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/application/revoke an application.html",
};

export async function remove(request: libs.Request, response: libs.Response) {
    let params: { application_id: string; } = request.params;

    if (!libs.validator.isMongoId(params.application_id)) {
        throw services.error.fromParameterIsInvalidMessage("application_id");
    }

    let id = new libs.ObjectId(params.application_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.deleteApplication);

    // the application should be available.
    let application = await services.mongo.Application.findOne({ _id: id })
        .exec();
    if (!application) {
        throw services.error.fromParameterIsInvalidMessage("application_id");
    }

    await services.mongo.AccessToken.findOneAndRemove({ creator: request.userId, application: id })
        .exec();

    services.logger.logRequest(documentOfRemove.url, request);
    services.response.sendSuccess(response, types.StatusCode.deleted);
}
