import * as types from "../../share/types";
import * as libs from "../../libs";
import * as settings from "../../settings";
import * as services from "../../services";

export const documentOfGet: types.Document = {
    url: "/api/user",
    method: types.httpMethod.get,
    documentUrl: "/api/user/get current user.html",
};

export async function get(request: libs.Request, response: libs.Response) {
    services.scope.shouldValidateAndContainScope(request, types.scopeNames.readUser);

    const user = await services.mongo.User.findOne({ _id: request.userId })
        .select("email name createdOrganizations joinedOrganizations avatar")
        .exec();
    const id = request.userId.toHexString();

    const result: types.UserResult = {
        user: {
            id: id,
            email: user.email,
            name: user.name,
            createdOrganizationCount: user.createdOrganizations.length,
            joinedOrganizationCount: user.joinedOrganizations.length,
            avatar: user.avatar || services.avatar.getDefaultName(id),
        },
    };

    services.response.sendSuccess(response, types.StatusCode.OK, result);
}

export const documentOfUpdate: types.Document = {
    url: "/api/user",
    method: types.httpMethod.put,
    documentUrl: "/api/user/update current user.html",
};

export async function update(request: libs.Request, response: libs.Response) {
    interface Body {
        name: string;
        avatarFileName: string;
    }

    const body: Body = request.body;

    const name = typeof body.name === "string" ? libs.validator.trim(body.name) : "";
    const avatarFileName = typeof body.avatarFileName === "string" ? libs.validator.trim(body.avatarFileName) : "";

    services.scope.shouldValidateAndContainScope(request, types.scopeNames.writeUser);

    const user = await services.mongo.User.findOne({ _id: request.userId })
        .select("name avatar")
        .exec();

    // if name changes, then change it.
    if (name && name !== user.name) {
        user.name = name;
        user.save();
    }

    // if change avatar, then move image.
    if (avatarFileName) {
        const newName = settings.imagePaths.avatar + request.userId.toHexString() + libs.path.extname(avatarFileName).toLowerCase();

        const json = await services.request.postAsync(`${settings.imageUploader}/api/persistence`, {
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
}
