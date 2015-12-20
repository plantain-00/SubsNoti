import * as types from "../../../types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/created",
    method: types.httpMethod.get,
    documentUrl: "/api/organization/get created organizations.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    services.scope.shouldValidateAndContainScope(request, types.scopeNames.readOrganization);

    let user = await services.mongo.User.findOne({ _id: request.userId })
        .populate("createdOrganizations")
        .select("createdOrganizations")
        .exec();
    let result: types.OrganizationsResult = {
        organizations: libs._.map(user.createdOrganizations, (o: services.mongo.OrganizationDocument) => {
            return {
                id: o._id.toHexString(),
                name: o.name,
            };
        }),
    };

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}
