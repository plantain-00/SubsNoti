import * as types from "../../../share/types";
import * as libs from "../../../libs";
import * as settings from "../../../settings";
import * as services from "../../../services";

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
            organizations: []
        };
    }

    // public organization is also available.
    result.organizations.push({
        id: services.seed.publicOrganizationId.toHexString(),
        name: services.seed.publicOrganizationName,
    });

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}
