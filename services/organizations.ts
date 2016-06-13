import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export const documentOfGetCreated: types.Document = {
    url: "/api/user/created",
    method: types.httpMethod.get,
    documentUrl: "/api/organization/get created organizations.html",
};

export async function getCreated(request: libs.Request, response: libs.Response) {
    services.scope.shouldValidateAndContainScope(request, types.scopeNames.readOrganization);

    const user = await services.mongo.User.findOne({ _id: request.userId })
        .populate("createdOrganizations")
        .select("createdOrganizations")
        .exec();
    const result: types.OrganizationsResult = {
        organizations: user.createdOrganizations.map((o: services.mongo.OrganizationDocument) => {
            return {
                id: o._id.toHexString(),
                name: o.name,
            };
        }),
    };

    services.response.sendSuccess(response, result);
}

export const documentOfCreate: types.Document = {
    url: "/api/organizations",
    method: types.httpMethod.post,
    documentUrl: "/api/organization/create an organization.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: { organizationName: string; } = request.body;

    const organizationName = typeof body.organizationName === "string" ? libs.validator.trim(body.organizationName) : "";
    services.utils.assert(organizationName !== "", services.error.parameterIsMissed, "organizationName");

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeOrganization);

    // the name should not be used by other organizations.
    services.utils.assert(organizationName !== services.seed.publicOrganizationName, services.error.theOrganizationNameAlreadyExists);
    const organizationCount = await services.mongo.Organization.count({ name: organizationName })
        .exec();
    services.utils.assert(organizationCount === 0, services.error.theOrganizationNameAlreadyExists);

    // current user should not create too many organizations.
    const user = await services.mongo.User.findOne({ _id: request.userId })
        .select("createdOrganizations joinedOrganizations")
        .exec();
    services.utils.assert(user.createdOrganizations.length < 3, `you already created ${user.createdOrganizations.length} organizations.`);

    const organization = await services.mongo.Organization.create({
        name: organizationName,
        status: types.OrganizationStatus.normal,
        creator: request.userId,
        members: [request.userId],
    });

    user.createdOrganizations.push(organization._id);
    user.joinedOrganizations.push(organization._id);

    user.save();

    services.logger.logRequest(documentOfCreate.url, request);
    services.response.sendSuccess(response);
}
