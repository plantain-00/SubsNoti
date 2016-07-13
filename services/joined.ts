import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export const documentOfGet: types.Document = {
    url: "/api/user/joined",
    method: types.httpMethod.get,
    documentUrl: "/api/organization/get joined organizations.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    let result: types.OrganizationsResult;

    if (request.userId
        && services.scope.contain(request, types.scopeNames.readOrganization)) {
        const user = await services.mongo.User.findOne({ _id: request.userId })
            .populate("joinedOrganizations")
            .select("joinedOrganizations")
            .exec();
        result = {
            organizations: user.joinedOrganizations.map((o: services.mongo.OrganizationDocument) => {
                return {
                    id: o._id.toHexString(),
                    name: o.name,
                };
            }),
        };
    } else {
        result = {
            organizations: [],
        };
    }

    // public organization is also available.
    result.organizations.push({
        id: services.seed.publicOrganizationId.toHexString(),
        name: services.seed.publicOrganizationName,
    });

    services.response.sendSuccess(response, result);
}

export const documentOfInvite: types.Document = {
    url: "/api/users/:user_email/joined/:organization_id",
    method: types.httpMethod.put,
    documentUrl: "/api/organization/invite an user.html",
};

export async function invite(request: libs.Request, response: libs.Response) {
    const {organization_id, user_email} = request.params;
    services.utils.assert(typeof organization_id === "string" && libs.validator.isMongoId(organization_id), services.error.parameterIsInvalid, "organization_id");
    services.utils.assert(typeof user_email === "string" && libs.validator.isEmail(user_email), services.error.parameterIsInvalid, "user_email");

    const organizationId = new libs.ObjectId(organization_id);
    const email = libs.validator.trim(user_email).toLowerCase();

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeOrganization);

    // the organization should be available.
    const organization = await services.mongo.Organization.findOne({ _id: organizationId })
        .select("members")
        .exec();
    services.utils.assert(organization, services.error.parameterIsInvalid, "organization_id");

    // the email should belong to one of users.
    const user = await services.mongo.User.findOne({ email: email })
        .select("_id joinedOrganizations")
        .exec();
    services.utils.assert(user, services.error.parameterIsInvalid, "user_email");

    // current user should be a member of the organization
    services.utils.assert(organization.members.find((m: libs.ObjectId) => m.equals(request.userId!)), services.error.theOrganizationIsPrivate);

    // if the user is already a member, do nothing.
    if (!organization.members.find((m: libs.ObjectId) => m.equals(user._id))) {
        user.joinedOrganizations.push(organizationId);
        organization.members.push(user._id);

        user.save();
        organization.save();
    }

    services.response.sendSuccess(response);
}
