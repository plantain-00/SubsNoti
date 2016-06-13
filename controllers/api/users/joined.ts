import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as services from "../../../services";

export const documentOfInvite: types.Document = {
    url: "/api/users/:user_email/joined/:organization_id",
    method: types.httpMethod.put,
    documentUrl: "/api/organization/invite an user.html",
};

export async function invite(request: libs.Request, response: libs.Response) {
    interface Params {
        organization_id: string;
        user_email: string;
    }

    const params: Params = request.params;
    libs.assert(typeof params.organization_id === "string" && libs.validator.isMongoId(params.organization_id), services.error.parameterIsInvalid, "organization_id");
    libs.assert(typeof params.user_email === "string" && libs.validator.isEmail(params.user_email), services.error.parameterIsInvalid, "user_email");

    const organizationId = new libs.ObjectId(params.organization_id);
    const email = libs.validator.trim(params.user_email).toLowerCase();

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeOrganization);

    // the organization should be available.
    const organization = await services.mongo.Organization.findOne({ _id: organizationId })
        .select("members")
        .exec();
    libs.assert(organization, services.error.parameterIsInvalid, "organization_id");

    // the email should belong to one of users.
    const user = await services.mongo.User.findOne({ email: email })
        .select("_id joinedOrganizations")
        .exec();
    libs.assert(user, services.error.parameterIsInvalid, "user_email");

    // current user should be a member of the organization
    libs.assert(organization.members.find((m: libs.ObjectId) => m.equals(request.userId)), services.error.theOrganizationIsPrivate);

    // if the user is already a member, do nothing.
    if (!organization.members.find((m: libs.ObjectId) => m.equals(user._id))) {
        user.joinedOrganizations.push(organizationId);
        organization.members.push(user._id);

        user.save();
        organization.save();
    }

    services.response.sendSuccess(response);
}
