import * as types from "../../../types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfInvite: types.Document = {
    url: "/api/users/:user_email/joined/:organization_id",
    method: "put",
    documentUrl: "/api/organization/invite an user.html",
};

export async function invite(request: libs.Request, response: libs.Response) {
    try {
        interface Params {
            organization_id: string;
            user_email: string;
        }

        let params: Params = request.params;

        if (!libs.validator.isMongoId(params.organization_id)) {
            throw services.error.fromParameterIsInvalidMessage("organization_id");
        }

        if (!libs.validator.isEmail(params.user_email)) {
            throw services.error.fromParameterIsInvalidMessage("user_email");
        }

        let organizationId = new libs.ObjectId(params.organization_id);
        let email = libs.validator.trim(params.user_email).toLowerCase();

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        // the organization should be available.
        let organization = await services.mongo.Organization.findOne({ _id: organizationId })
            .select("members")
            .exec();
        if (!organization) {
            throw services.error.fromParameterIsInvalidMessage("organization_id");
        }

        // the email should belong to one of users.
        let user = await services.mongo.User.findOne({ email: email })
            .select("_id joinedOrganizations")
            .exec();
        if (!user) {
            throw services.error.fromParameterIsInvalidMessage("user_email");
        }

        // current user should be a member of the organization
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.equals(request.userId))) {
            throw services.error.fromOrganizationIsPrivateMessage();
        }

        // if the user is already a member, do nothing.
        if (!libs._.find(organization.members, (m: libs.ObjectId) => m.equals(user._id))) {
            user.joinedOrganizations.push(organizationId);
            organization.members.push(user._id);

            user.save();
            organization.save();
        }

        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
