import * as types from "../../../types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/authorized",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get authorized applications.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);

        let accessTokens = await services.mongo.AccessToken.find({ creator: request.userId })
            .populate("application")
            .exec();

        for (let accessToken of accessTokens) {
            await services.mongo.User.populate(accessToken.application, "creator");
        }

        let result: types.ApplicationsResult = {
            applications: libs._.map(libs._.filter(accessTokens, ac => ac.application), ac => {
                let a = <services.mongo.ApplicationDocument>ac.application;
                let creator = <services.mongo.UserDocument>a.creator;
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
                    scopes: libs._.filter(settings.scopes, s => libs._.any(ac.scopes, sc => sc === s.name)),
                    lastUsed: ac.lastUsed ? ac.lastUsed.toISOString() : null,
                };
            }),
        };

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfRemove: types.Document = {
    url: "/api/user/authorized/:application_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/application/revoke an application.html",
};

export async function remove(request: libs.Request, response: libs.Response) {
    try {
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

        services.logger.log(documentOfRemove.url, request);
        services.response.sendSuccess(response, types.StatusCode.deleted);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
