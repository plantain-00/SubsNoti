import * as libs from "../../../libs";
import * as settings from "../../../settings";

import * as enums from "../../../enums/enums";
import * as interfaces from "../../../interfaces/interfaces";

import * as services from "../../../services/services";

const documentOfGet: interfaces.ApiDocument = {
    url: "/api/user/joined/organizations",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html"
};

export function get(request: libs.Request, response: libs.Response): void {
    const documentUrl = documentOfGet.documentUrl;

    services.currentUser.get(request, response, documentUrl, (error, user) => {
        if (error) {
            services.response.sendUnauthorizedError(response, error.message, documentUrl);
            return;
        }

        services.organization.getByMemberId(user.id, (error, organizations) => {
			if (error) {
				services.response.sendDBAccessError(response, error.message, documentUrl);
				return;
			}

			const result: interfaces.GetOrganizationsResponse = {
				organizations: libs._.map(organizations, (o: interfaces.Organization) => {
					return {
						id: o.id,
						name: o.name
					};
				})
			};

			services.response.sendOK(response, documentUrl, result);
		});
    });
}

export function route(app: libs.Application) {
    app[documentOfGet.method](documentOfGet.url, get);
}