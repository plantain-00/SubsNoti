import * as types from "../../../types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

export let documentOfGet: types.Document = {
    url: "/api/user/joined",
    method: "get",
    documentUrl: "/api/organization/get joined organizations.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        let result: types.OrganizationsResult;

        if (request.userId
            && services.scope.contain(request, types.scopeNames.readOrganization)) {
            let user = await services.mongo.User.findOne({ _id: request.userId })
                .populate("joinedOrganizations")
                .select("joinedOrganizations")
                .exec();
            result = {
                organizations: libs._.map(user.joinedOrganizations, (o: services.mongo.OrganizationDocument) => {
                    return {
                        id: o._id.toHexString(),
                        name: o.name,
                    };
                }),
            };
        } else {
            result = {
                organizations: []
            };
        }

        // public organization is also available.
        result.organizations.push({
            id: services.seed.publicOrganizationId.toHexString(),
            name: services.seed.publicOrganizationName,
        });

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error);
    }
}
