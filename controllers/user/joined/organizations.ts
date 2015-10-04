import * as libs from "../../../libs";
import * as settings from "../../../settings";

import * as enums from "../../../enums/enums";
import * as interfaces from "../../../interfaces/interfaces";

import * as services from "../../../services/services";

let documentOfGet: interfaces.ApiDocument = {
    url: "/api/user/joined/organizations",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html"
};

export function get(request: libs.Request, response: libs.Response): void {
    let documentUrl = documentOfGet.documentUrl;

    services.currentUser.get(request, documentUrl).then(user=> {
		return services.organization.getByMemberId(user.id).then(organizations=> {
			let result: interfaces.GetOrganizationsResponse = {
				organizations: libs._.map(organizations, (o: interfaces.Organization) => {
					return {
						id: o.id,
						name: o.name
					};
				})
			};

			services.response.sendOK(response, documentUrl, result);
		}).catch(error=> {
			services.response.sendDBAccessError(response, error.message, documentUrl);
		})
	}, error=> {
		services.response.sendUnauthorizedError(response, error.message, documentUrl);
	});
}

export function route(app: libs.Application) {
    app[documentOfGet.method](documentOfGet.url, get);
}