import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../enums/enums";
import * as interfaces from "../../interfaces/interfaces";

import * as services from "../../services/services";

const documentOfGet: interfaces.ApiDocument = {
    url: "/api/organizations/:organization_id/themes",
    method: "get",
    documentUrl: "/doc/api/Get themes of an organization.html"
};

export function get(request: libs.Request, response: libs.Response) {
    const documentUrl = documentOfGet.documentUrl;

    const organizationId = request.params.organization_id;

    services.currentUser.get(request, documentUrl).then(user=> {
        return services.organization.getByMemberId(user.id).then(organizations=> {
            if (libs._.every(organizations, (o: interfaces.Organization) => o.id != organizationId)) {
                services.response.sendUnauthorizedError(response, "can not access the organization", documentUrl);
                return;
            }

            return services.theme.getInOrganizationId(organizationId).then(themes=> {
                const result: interfaces.GetThemesResponse = {
                    themes: libs._.map(themes, (t: interfaces.Theme) => {
                        return {
                            id: t.id,
                            title: t.title,
                            detail: t.detail,
                            organizationId: t.organizationId,
                            createTime: t.createTime.getTime()
                        };
                    })
                };

                services.response.sendOK(response, documentUrl, result);
            }, error=> {
                services.response.sendDBAccessError(response, error.message, documentUrl);
            });
        }, error=> {
            services.response.sendDBAccessError(response, error.message, documentUrl);
        });
    }, error=> {
        services.response.sendUnauthorizedError(response, error.message, documentUrl);
    });
}

export function route(app: libs.Application) {
    app[documentOfGet.method](documentOfGet.url, get);
}