import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as services from "../../../services";

export const documentOfGet: types.Document = {
    url: "/api/user/registered",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get registered applications.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);

    const applications = await services.mongo.Application.find({ creator: request.userId })
        .exec();

    const result: types.ApplicationsResult = {
        applications: applications.map(a => {
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

    services.response.sendSuccess(response, result);
}

interface Body {
    name: string;
    homeUrl: string;
    description: string;
    authorizationCallbackUrl: string;
}

export const documentOfCreate: types.Document = {
    url: "/api/user/registered",
    method: types.httpMethod.post,
    documentUrl: "/api/application/register an application.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: Body = request.body;

    const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
    services.utils.assert(name !== "", services.error.parameterIsMissed, "name");
    services.utils.assert(typeof body.homeUrl === "string" && libs.validator.isURL(body.homeUrl), services.error.parameterIsInvalid, "homeUrl");
    const homeUrl = libs.validator.trim(body.homeUrl);
    const description = typeof body.description === "string" ? libs.validator.trim(body.description) : "";
    services.utils.assert(typeof body.authorizationCallbackUrl === "string" && libs.validator.isURL(body.authorizationCallbackUrl), services.error.parameterIsInvalid, "authorizationCallbackUrl");
    const authorizationCallbackUrl = libs.validator.trim(body.authorizationCallbackUrl);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);

    const application = await services.mongo.Application.create({
        name,
        homeUrl,
        description,
        authorizationCallbackUrl,
        clientId: services.utils.generateUuid(),
        clientSecret: services.utils.generateUuid(),
        creator: request.userId,
    });

    application.save();

    services.logger.logRequest(documentOfCreate.url, request);
    services.response.sendSuccess(response);
}

export const documentOfUpdate: types.Document = {
    url: "/api/user/registered/:application_id",
    method: types.httpMethod.put,
    documentUrl: "/api/application/update an application.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    const params: { application_id: string; } = request.params;
    services.utils.assert(typeof params.application_id === "string" && libs.validator.isMongoId(params.application_id), services.error.parameterIsInvalid, "application_id");

    const body: Body = request.body;

    const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
    services.utils.assert(name !== "", services.error.parameterIsInvalid, "name");
    services.utils.assert(typeof body.homeUrl === "string" && libs.validator.isURL(body.homeUrl), services.error.parameterIsInvalid, "homeUrl");
    const homeUrl = libs.validator.trim(body.homeUrl);

    const description = typeof body.description === "string" ? libs.validator.trim(body.description) : "";
    services.utils.assert(typeof body.authorizationCallbackUrl === "string" && libs.validator.isURL(body.authorizationCallbackUrl), services.error.parameterIsInvalid, "authorizationCallbackUrl");
    const authorizationCallbackUrl = libs.validator.trim(body.authorizationCallbackUrl);

    const id = new libs.ObjectId(params.application_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);

    // the application should be available.
    const application = await services.mongo.Application.findOne({ _id: id })
        .exec();
    services.utils.assert(application, services.error.parameterIsInvalid, "application_id");

    application.name = name;
    application.homeUrl = homeUrl;
    application.description = description;
    application.authorizationCallbackUrl = authorizationCallbackUrl;

    application.save();

    services.logger.logRequest(documentOfUpdate.url, request);
    services.response.sendSuccess(response);
}

export const documentOfRemove: types.Document = {
    url: "/api/user/registered/:application_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/application/delete an application.html",
};

export async function remove(request: libs.Request, response: libs.Response) {
    const params: { application_id: string; } = request.params;
    services.utils.assert(typeof params.application_id === "string" && libs.validator.isMongoId(params.application_id), services.error.parameterIsInvalid, "application_id");

    const id = new libs.ObjectId(params.application_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.deleteApplication);

    // the application should be available.
    const application = await services.mongo.Application.findOne({ _id: id })
        .exec();
    services.utils.assert(application, services.error.parameterIsInvalid, "application_id");

    await services.mongo.AccessToken.remove({ application: application._id }).exec();

    application.remove();

    services.logger.logRequest(documentOfRemove.url, request);
    services.response.sendSuccess(response);
}
