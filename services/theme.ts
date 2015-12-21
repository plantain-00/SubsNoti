import * as types from "../types";
import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export function convert(theme: services.mongo.ThemeDocument): types.Theme {
    let creator = theme.creator as services.mongo.UserDocument;
    let creatorId = creator._id.toHexString();
    let result: types.Theme = {
        id: theme._id.toHexString(),
        title: theme.title,
        detail: theme.detail,
        organizationId: (theme.organization as libs.ObjectId).toHexString(),
        createTime: theme.createTime.toISOString(),
        updateTime: theme.updateTime ? theme.updateTime.toISOString() : undefined,
        status: services.themeStatus.getType(theme.status),
        creator: {
            id: creatorId,
            name: creator.name,
            email: creator.email,
            avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
        },
        owners: libs._.map(theme.owners as services.mongo.UserDocument[], o => {
            let id = o._id.toHexString();
            return {
                id: id,
                name: o.name,
                email: o.email,
                avatar: o.avatar || services.avatar.getDefaultName(id),
            };
        }),
        watchers: libs._.map(theme.watchers as services.mongo.UserDocument[], w => {
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
