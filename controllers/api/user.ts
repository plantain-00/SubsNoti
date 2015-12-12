"use strict";

import * as types from "../../types";

import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export let documentOfGet: types.Document = {
    url: "/api/user",
    method: "get",
    documentUrl: "/api/user/get current user.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    try {
        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        let user = await services.mongo.User.findOne({ _id: request.userId })
            .select("email name createdOrganizations joinedOrganizations avatar")
            .exec();
        let id = request.userId.toHexString();

        services.response.sendSuccess(response, types.StatusCode.OK, {
            id: id,
            email: user.email,
            name: user.name,
            createdOrganizationCount: user.createdOrganizations.length,
            joinedOrganizationCount: user.joinedOrganizations.length,
            avatar: user.avatar || services.avatar.getDefaultName(id),
        });
    } catch (error) {
        services.response.sendError(response, error);
    }
}

export let documentOfUpdate: types.Document = {
    url: "/api/user",
    method: "put",
    documentUrl: "/api/user/update current user.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    try {
        interface Body {
            name: string;
            avatarFileName: string;
        }

        let body: Body = request.body;

        let name = libs.validator.trim(body.name);
        let avatarFileName = libs.validator.trim(body.avatarFileName);

        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }

        let user = await services.mongo.User.findOne({ _id: request.userId })
            .select("name avatar")
            .exec();

        // if name changes, then change it.
        if (name && name !== user.name) {
            user.name = name;
            user.save();
        }

        // if change avatar, then move image.
        if (avatarFileName) {
            let newName = settings.imagePaths.avatar + request.userId.toHexString() + libs.path.extname(avatarFileName).toLowerCase();

            let json = await services.request.postAsync(`${settings.imageUploader}/api/persistence`, {
                name: avatarFileName,
                newName: newName,
            });

            // save new avatar name.
            user.avatar = newName;
            user.save();

            response.status(json.response.statusCode).json(json.body);
        } else {
            services.response.sendSuccess(response, types.StatusCode.createdOrModified);
        }
    } catch (error) {
        services.response.sendError(response, error);
    }
}
