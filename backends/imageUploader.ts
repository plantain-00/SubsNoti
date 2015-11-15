"use strict";

import * as types from "../common/types";

import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

let app: libs.Application = libs.express();

app.settings.env = settings.config.currentEnvironment;

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));

app.use(libs.cors(settings.config.cors));

services.cache.connect();

let documentOfUploadPersistentImages = {
    url: "/api/persistent/images",
    method: "post",
    documentUrl: "Upload images to persistent directory.html",
};

let documentOfUploadTemperaryImages = {
    url: "/api/temperary/images",
    method: "post",
    documentUrl: "Upload images to temperary directory.html",
};

let storage = libs.multer.diskStorage({
    destination: function(request: libs.Request, file, next) {
        if (request.path === documentOfUploadPersistentImages.url) {
            next(null, "images/");
        } else if (request.path === documentOfUploadTemperaryImages.url) {
            next(null, "images/tmp/");
        } else {
            next(services.error.fromMessage("can not upload files at this url:" + request.path, types.StatusCode.forbidden));
        }
    },
    filename: function(request: libs.Request, file, next) {
        if (request.path === documentOfUploadPersistentImages.url) {
            next(null, file.fieldname);
        } else if (request.path === documentOfUploadTemperaryImages.url) {
            next(null, libs.generateUuid() + libs.path.extname(file.originalname));
        } else {
            next(services.error.fromMessage("can not upload files at this url:" + request.path, types.StatusCode.forbidden));
        }
    },
});

let upload = libs.multer({ storage: storage }).any();

app.post(documentOfUploadPersistentImages.url, (request: libs.Request, response: libs.Response) => {
    let documentUrl = documentOfUploadPersistentImages.documentUrl;

    if (!libs._.find(settings.config.ipWhiteList, i => i === request.ip)) {
        services.response.sendError(response, services.error.fromMessage(`your ip ${request.ip} in not in the white list.`, types.StatusCode.forbidden), documentUrl);
        return;
    }

    upload(request, response, error => {
        if (error) {
            services.response.sendError(response, services.error.fromError(error, types.StatusCode.invalidRequest), documentUrl);
            return;
        }

        services.response.sendSuccess(response, types.StatusCode.createdOrModified, {
            names: libs._.map(request.files, (f: any) => f.filename)
        });
    });
});

app.post(documentOfUploadTemperaryImages.url, async(request: libs.Request, response: libs.Response) => {
    let documentUrl = documentOfUploadTemperaryImages.documentUrl;

    try {
        let userId = await services.authenticationCredential.authenticate(request);

        upload(request, response, error => {
            if (error) {
                services.response.sendError(response, services.error.fromError(error, types.StatusCode.invalidRequest), documentUrl);
                return;
            }

            services.response.sendSuccess(response, types.StatusCode.createdOrModified, {
                names: libs._.map(request.files, (f: any) => f.filename)
            });
        });
    } catch (error) {
        services.response.sendError(response, error, documentUrl);
    }
});

let documentOfMoveImage = {
    url: "/api/images/persistent",
    method: "post",
    documentUrl: "Move image from temperary directory to persistent directory.html",
};

app.post(documentOfMoveImage.url, (request: libs.Request, response: libs.Response) => {
    let name = libs.validator.trim(request.body.name);
    let newName = libs.validator.trim(request.body.newName);

    if (!name) {
        services.response.sendError(response, services.error.fromParameterIsMissedMessage("name"), documentOfMoveImage.documentUrl);
        return;
    }

    if (!newName) {
        services.response.sendError(response, services.error.fromParameterIsMissedMessage("newName"), documentOfMoveImage.documentUrl);
        return;
    }

    if (!libs._.find(settings.config.ipWhiteList, i => i === request.ip)) {
        services.response.sendError(response, services.error.fromMessage(`your ip ${request.ip} in not in the white list.`, types.StatusCode.forbidden), documentOfUploadPersistentImages.documentUrl);
        return;
    }

    libs.fs.rename(libs.path.join(__dirname, `../images/tmp/${name}`), libs.path.join(__dirname, `../images/${newName}`), error => {
        if (error) {
            services.response.sendError(response, services.error.fromMessage(error.message, types.StatusCode.invalidRequest), documentOfMoveImage.documentUrl);
            return;
        }

        services.response.sendSuccess(response, types.StatusCode.createdOrModified);
    });
});

app.listen(settings.config.imageUploader.port, settings.config.imageUploader.innerHostName, () => {
    console.log(`Image uploader is listening: ${settings.config.imageUploader.innerHostName}:${settings.config.imageUploader.port}`);
});
