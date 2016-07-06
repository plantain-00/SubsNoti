import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

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
    services.utils.assert(typeof params.application_id === "string" && libs.validator.isMongoId(params.application_id), services.error.parameterIsInvalid, "application_id");

    const id = new libs.ObjectId(params.application_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeApplication);

    // the application should be available.
    const application = await services.mongo.Application.findOne({ _id: id })
        .exec();
    services.utils.assert(application, services.error.parameterIsInvalid, "application_id");

    application.clientSecret = services.utils.generateUuid();

    application.save();

    services.logger.logRequest(documentOfReset.url, request);
    services.response.sendSuccess(response);
}

export const documentOfGetAuthorized: types.Document = {
    url: "/api/user/authorized",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get authorized applications.html",
};

export async function getAuthorized(request: libs.Request, response: libs.Response) {
    services.scope.shouldValidateAndContainScope(request, types.scopeNames.readApplication);

    const accessTokens = await services.mongo.AccessToken.find({ creator: request.userId })
        .populate("application")
        .exec();

    for (const {application} of accessTokens) {
        await services.mongo.User.populate(application, "creator");
    }

    const result: types.ApplicationsResult = {
        applications: accessTokens.filter(ac => !!ac.application).map(ac => {
            const a = ac.application as services.mongo.ApplicationDocument;
            const creator = a.creator as services.mongo.UserDocument;
            const creatorId = creator._id.toHexString();
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
                scopes: services.settings.scopes.filter(s => ac.scopes.some(sc => sc === s.name)),
                lastUsed: ac.lastUsed ? ac.lastUsed.toISOString() : undefined,
            };
        }),
    };

    services.response.sendSuccess(response, result);
}

export const documentOfRemoveAuthorized: types.Document = {
    url: "/api/user/authorized/:application_id",
    method: types.httpMethod.delete,
    documentUrl: "/api/application/revoke an application.html",
};

export async function removeAuthorized(request: libs.Request, response: libs.Response) {
    const params: { application_id: string; } = request.params;
    services.utils.assert(typeof params.application_id === "string" && libs.validator.isMongoId(params.application_id), services.error.parameterIsInvalid, "application_id");

    const id = new libs.ObjectId(params.application_id);

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.deleteApplication);

    // the application should be available.
    const application = await services.mongo.Application.findOne({ _id: id })
        .exec();
    services.utils.assert(application, services.error.parameterIsInvalid, "application_id");

    await services.mongo.AccessToken.findOneAndRemove({ creator: request.userId, application: id })
        .exec();

    services.logger.logRequest(documentOfRemoveAuthorized.url, request);
    services.response.sendSuccess(response);
}

export const documentOfGetRegistered: types.Document = {
    url: "/api/user/registered",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get registered applications.html",
};

export async function getRegistered(request: libs.Request, response: libs.Response) {
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

export const documentOfGet: types.Document = {
    url: "/api/applications/:id",
    method: types.httpMethod.get,
    documentUrl: "/api/application/get an application.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    const params: { id: string; } = request.params;
    services.utils.assert(typeof params.id === "string" && libs.validator.isMongoId(params.id), services.error.parameterIsInvalid, "id");

    const id = new libs.ObjectId(params.id);
    const application = await services.mongo.Application.findOne({ _id: id })
        .populate("creator")
        .exec();
    services.utils.assert(application, services.error.parameterIsInvalid, "id");

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
