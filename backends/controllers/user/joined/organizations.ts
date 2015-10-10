'use strict';

import * as libs from "../../../libs";
import * as settings from "../../../settings";

import * as enums from "../../../../common/enums";
import * as interfaces from "../../../../common/interfaces";

import * as services from "../../../services";

let documentOfGet = {
    url: "/api/user/joined/organizations",
    method: "get",
    documentUrl: "/doc/api/Get joined organizations.html"
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let user = await services.user.getCurrent(request, documentUrl);
        let organizations = await services.organization.getByMemberId(user.id);
        let result = {
            organizations: libs._.map(organizations, o => {
                return {
                    id: o.id,
                    name: o.name
                };
            })
        };

        services.response.sendOK(response, documentUrl, result);
    } catch (error) {
        services.response.sendError(response, documentUrl, error);
    }
}

export function route(app: libs.Application) {
    app[documentOfGet.method](documentOfGet.url, get);
}
