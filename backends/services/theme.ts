"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let publicOrganizationId: libs.ObjectId;
export let publicOrganizationName = "public";

export function convert(theme: services.mongo.ThemeDocument, v?: string): types.Theme {
    if (!v) {
        v = "0.11.5";
    }

    let creator = <services.mongo.UserDocument>theme.creator;
    let creatorId = creator._id.toHexString();
    let result: types.Theme = {
        id: theme._id.toHexString(),
        title: theme.title,
        detail: theme.detail,
        organizationId: (<libs.ObjectId>theme.organization).toHexString(),
        createTime: services.version.isNotExpired(v, "<0.10.2", "2015-11-22") ? theme.createTime.getTime() : theme.createTime.toISOString(),
        updateTime: theme.updateTime ? (services.version.isNotExpired(v, "<0.10.2", "2015-11-22") ? theme.updateTime.getTime() : theme.updateTime.toISOString()) : undefined,
        status: services.version.isNotExpired(v, "<0.10.1", "2015-11-22") ? theme.status : services.themeStatus.getType(theme.status),
        creator: {
            id: creatorId,
            name: creator.name,
            email: creator.email,
            avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
        },
        owners: libs._.map(<services.mongo.UserDocument[]>theme.owners, o => {
            let id = o._id.toHexString();
            return {
                id: id,
                name: o.name,
                email: o.email,
                avatar: o.avatar || services.avatar.getDefaultName(id),
            };
        }),
        watchers: libs._.map(<services.mongo.UserDocument[]>theme.watchers, w => {
            let id = w._id.toHexString();
            return {
                id: id,
                name: w.name,
                email: w.email,
                avatar: w.avatar || services.avatar.getDefaultName(id),
            };
        }),
    };

    return result;
}
