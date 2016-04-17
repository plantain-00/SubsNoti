"use strict";
const services = require("../services");
function convert(theme) {
    const creator = theme.creator;
    const creatorId = creator._id.toHexString();
    const result = {
        id: theme._id.toHexString(),
        title: theme.title,
        detail: theme.detail,
        organizationId: theme.organization.toHexString(),
        createTime: theme.createTime.toISOString(),
        updateTime: theme.updateTime ? theme.updateTime.toISOString() : undefined,
        status: services.themeStatus.getType(theme.status),
        creator: {
            id: creatorId,
            name: creator.name,
            email: creator.email,
            avatar: creator.avatar || services.avatar.getDefaultName(creatorId),
        },
        owners: theme.owners.map(o => {
            const id = o._id.toHexString();
            return {
                id: id,
                name: o.name,
                email: o.email,
                avatar: o.avatar || services.avatar.getDefaultName(id),
            };
        }),
        watchers: theme.watchers.map(w => {
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
exports.convert = convert;
