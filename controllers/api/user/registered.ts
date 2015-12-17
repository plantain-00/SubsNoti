import * as types from "../../../types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/registered",
    method: "get",
    documentUrl: "/api/application/get registered applications.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);

        let applications = await services.mongo.Application.find({ creator: request.userId })
            .exec();

        let result: types.ApplicationResult = {
            applications: libs._.map(applications, a => {
                return {
                    id: a._id.toHexString(),
                    name: a.name,
                    homeUrl: a.homeUrl,
                    description: a.description,
                    authorizationCallbackUrl: a.authorizationCallbackUrl,
                    clientId: a.clientId,
                    clientSecret: a.clientSecret,
                };
            }),
        };

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

interface Body {
    name: string;
    homeUrl: string;
    description: string;
    authorizationCallbackUrl: string;
}

export let documentOfCreate: types.Document = {
    url: "/api/user/registered",
    method: "post",
    documentUrl: "/api/application/register an application.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    try {
        let body: Body = request.body;

        let name = libs.validator.trim(body.name);
        if (name === "") {
            throw services.error.fromParameterIsMissedMessage("name");
        }

        if (!libs.validator.isURL(body.homeUrl)) {
            throw services.error.fromParameterIsInvalidMessage("homeUrl");
        }
        let homeUrl = libs.validator.trim(body.homeUrl);

        let description = libs.validator.trim(body.description);

        if (!libs.validator.isURL(body.authorizationCallbackUrl)) {
            throw services.error.fromParameterIsInvalidMessage("authorizationCallbackUrl");
        }
        let authorizationCallbackUrl = libs.validator.trim(body.authorizationCallbackUrl);

        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);

        let application = await services.mongo.Application.create({
            name: name,
            homeUrl: homeUrl,
            description: description,
            authorizationCallbackUrl: authorizationCallbackUrl,
            clientId: libs.generateUuid(),
            clientSecret: libs.generateUuid(),
            creator: request.userId,
        });

        application.save();

        services.logger.log(documentOfCreate.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfUpdate: types.Document = {
    url: "/api/user/registered/:application_id",
    method: "put",
    documentUrl: "/api/application/update an application.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    try {
        let params: { application_id: string; } = request.params;

        if (!libs.validator.isMongoId(params.application_id)) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }

        let body: Body = request.body;

        let name = libs.validator.trim(body.name);
        if (name === "") {
            throw services.error.fromParameterIsMissedMessage("name");
        }

        if (!libs.validator.isURL(body.homeUrl)) {
            throw services.error.fromParameterIsInvalidMessage("homeUrl");
        }
        let homeUrl = libs.validator.trim(body.homeUrl);

        let description = libs.validator.trim(body.description);

        if (!libs.validator.isURL(body.authorizationCallbackUrl)) {
            throw services.error.fromParameterIsInvalidMessage("authorizationCallbackUrl");
        }
        let authorizationCallbackUrl = libs.validator.trim(body.authorizationCallbackUrl);

        let id = new libs.ObjectId(params.application_id);

        services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);

        // the application should be available.
        let application = await services.mongo.Application.findOne({ _id: id })
            .exec();
        if (!application) {
            throw services.error.fromParameterIsInvalidMessage("application_id");
        }

        application.name = name;
        application.homeUrl = homeUrl;
        application.description = description;
        application.authorizationCallbackUrl = authorizationCallbackUrl;

        application.save();

        services.logger.log(documentOfUpdate.url, request);
        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfRemove: types.Document = {
    url: "/api/user/registered/:application_id",
    method: "delete",
    documentUrl: "/api/application/delete an application.html",
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

        application.remove();

        services.logger.log(documentOfRemove.url, request);
        services.response.sendSuccess(response, types.StatusCode.deleted);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
