import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export const documentOfCreate: types.Document = {
    url: "/api/organizations",
    method: types.httpMethod.post,
    documentUrl: "/api/organization/create an organization.html",
};

export async function create(request: libs.Request, response: libs.Response) {
    const body: { organizationName: string; } = request.body;

    const organizationName = typeof body.organizationName === "string" ? libs.validator.trim(body.organizationName) : "";
    libs.assert(organizationName !== "", services.error.parameterIsMissed, "organizationName");

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeOrganization);

    // the name should not be used by other organizations.
    libs.assert(organizationName !== services.seed.publicOrganizationName, services.error.theOrganizationNameAlreadyExists);
    const organizationCount = await services.mongo.Organization.count({ name: organizationName })
        .exec();
    libs.assert(organizationCount === 0, services.error.theOrganizationNameAlreadyExists);

    // current user should not create too many organizations.
    const user = await services.mongo.User.findOne({ _id: request.userId })
        .select("createdOrganizations joinedOrganizations")
        .exec();
    libs.assert(user.createdOrganizations.length < settings.maxOrganizationNumberUserCanCreate, `you already created ${user.createdOrganizations.length} organizations.`);

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
