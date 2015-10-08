import * as libs from "../../libs";
import * as settings from "../../settings";

import * as enums from "../../../common/enums";
import * as interfaces from "../../../common/interfaces";

import * as services from "../../services";

let documentOfGet = {
    url: "/api/organizations/:organization_id/themes",
    method: "get",
    documentUrl: "/doc/api/Get themes of an organization.html"
};

export function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    let organizationId = request.params.organization_id;

    services.user.getCurrent(request, documentUrl).then(user=> {
        return services.organization.getByMemberId(user.id).then(organizations=> {
            if (libs._.every(organizations, o => o.id != organizationId)) {
                services.response.sendUnauthorizedError(response, "can not access the organization", documentUrl);
                return;
            }

            return services.theme.getInOrganizationId(organizationId).then(themes=> {
                let themeIds = libs._.map(themes, t=> t.id);
                return services.ownership.getByThemeIds(themeIds).then(ownerships=> {
                    return services.watched.getByThemeIds(themeIds).then(watcheds=> {
                        let result = {
                            themes: []
                        };

                        libs._.each(themes, t => {
                            let theme = {
                                id: t.id,
                                title: t.title,
                                detail: t.detail,
                                organizationId: t.organizationId,
                                createTime: t.createTime.getTime(),
                                creator: t.creator,
                                owners: [],
                                watchers: []
                            };

                            let ownership = libs._.find(ownerships, o=> o.themeId == theme.id);
                            if (ownership) {
                                theme.owners = ownership.owners;
                            }

                            let watched = libs._.find(watcheds, w=> w.themeId == theme.id);
                            if (watched) {
                                theme.watchers = watched.watchers;
                            }

                            result.themes.push(theme);
                        })

                        services.response.sendOK(response, documentUrl, result);
                    });
                });
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