import * as types from "../share/types";
import * as libs from "../libs";
import * as services from "../services";

export function convert(theme: services.mongo.ThemeDocument): types.Theme {
    const creator = theme.creator as services.mongo.UserDocument;
    const creatorId = creator._id.toHexString();
    const result: types.Theme = {
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
        owners: (theme.owners as services.mongo.UserDocument[]).map(o => {
            const id = o._id.toHexString();
            return {
                id: id,
                name: o.name,
                email: o.email,
                avatar: o.avatar || services.avatar.getDefaultName(id),
            };
        }),
        watchers: (theme.watchers as services.mongo.UserDocument[]).map(w => {
            const id = w._id.toHexString();
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
