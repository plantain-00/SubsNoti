"use strict";

import * as types from "../../common/types";

import * as libs from "../libs";
import * as settings from "../settings";
import * as services from "../services";

export let documentOfGet: types.Document = {
    url: "/api/user",
    method: "get",
    documentUrl: "/doc/api/Get current user.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let userId = await services.authenticationCredential.authenticate(request);

        let user = await services.mongo.User.findOne({ _id: userId })
            .select("email name createdOrganizations joinedOrganizations avatar")
            .exec();
        let id = userId.toHexString();
        let result: types.CurrentUserResponse = {
            id: id,
            email: user.email,
            name: user.name,
            createdOrganizationCount: user.createdOrganizations.length,
            joinedOrganizationCount: user.joinedOrganizations.length,
            avatar: user.avatar || services.avatar.getDefaultName(id),
        };

        services.response.sendSuccess(response, types.StatusCode.OK, result);
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}

export let documentOfUpdate: types.Document = {
    url: "/api/user",
    method: "put",
    documentUrl: "/doc/api/Update current user.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    let documentUrl = documentOfGet.documentUrl;

    try {
        let name = libs.validator.trim(request.body.name);
        let avatarFileName = libs.validator.trim(request.body.avatarFileName);

        let userId = await services.authenticationCredential.authenticate(request);

        let user = await services.mongo.User.findOne({ _id: userId })
            .select("name avatar")
            .exec();

        // if name changes, then change it.
        if (name && name !== user.name) {
            user.name = name;
            user.save();
        }

        // if change avatar, then move image.
        if (avatarFileName) {
            let newName = settings.config.avatar + userId.toHexString() + libs.path.extname(avatarFileName).toLowerCase();

            let json = await services.request.postAsync(`http://${settings.config.imageUploader.outerHostName}:${settings.config.imageUploader.port}/api/images/persistent`, {
                name: avatarFileName,
                newName: newName,
            });

            // save new avatar name.
            user.avatar = newName;
            user.save();

            response.status(json.response.statusCode).json(json.json);
        } else {
            services.response.sendSuccess(response, types.StatusCode.createdOrModified);
        }
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
}
