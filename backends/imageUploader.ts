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
    url: "/api/persistent",
    method: "post",
    documentUrl: "Upload images to persistent directory.html",
};

let documentOfUploadTemperaryImages = {
    url: "/api/temperary",
    method: "post",
    documentUrl: "Upload images to temperary directory.html",
};

let documentOfMoveImage = {
    url: "/api/persistence",
    method: "post",
    documentUrl: "Move image from temperary directory to persistent directory.html",
};

let storage = libs.multer.diskStorage({
    destination: function(request: libs.Request, file, next) {
        if (request.path === documentOfUploadPersistentImages.url || request.path === "/api/persistent/images") {
            next(null, "images/");
        } else if (request.path === documentOfUploadTemperaryImages.url || request.path === "/api/temperary/images") {
            next(null, "images/tmp/");
        } else {
            next(services.error.fromMessage("can not upload files at this url:" + request.path, types.StatusCode.forbidden));
        }
    },
    filename: function(request: libs.Request, file, next) {
        if (request.path === documentOfUploadPersistentImages.url || request.path === "/api/persistent/images") {
            next(null, file.fieldname);
        } else if (request.path === documentOfUploadTemperaryImages.url || request.path === "/api/temperary/images") {
            next(null, libs.generateUuid() + libs.path.extname(file.originalname));
        } else {
            next(services.error.fromMessage("can not upload files at this url:" + request.path, types.StatusCode.forbidden));
        }
    },
});

let upload = libs.multer({ storage: storage }).any();

services.version.route(app);

function uploadPersistentImages(request: libs.Request, response: libs.Response) {
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
}

async function uploadTemperaryImages(request: libs.Request, response: libs.Response) {
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
}

function moveImage(request: libs.Request, response: libs.Response) {
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
}

app.post(documentOfUploadPersistentImages.url, uploadPersistentImages);
app.post(documentOfUploadTemperaryImages.url, uploadTemperaryImages);
app.post(documentOfMoveImage.url, moveImage);

app.post("/api/temperary/images", (request: libs.Request, response: libs.Response) => {
    if (services.version.match(request.v, ">=0.12.3", "2015-11-25")) {
        response.status(404);
    } else {
        uploadTemperaryImages(request, response);
    }
});

app.post("/api/persistent/images", (request: libs.Request, response: libs.Response) => {
    if (services.version.match(request.v, ">=0.12.5", "2015-11-26")) {
        response.status(404);
    } else {
        uploadPersistentImages(request, response);
    }
});
app.post("/api/images/persistent", (request: libs.Request, response: libs.Response) => {
    if (services.version.match(request.v, ">=0.12.6", "2015-11-26")) {
        response.status(404);
    } else {
        moveImage(request, response);
    }
});

app.listen(settings.config.imageUploader.port, settings.config.imageUploader.innerHostName, () => {
    console.log(`Image uploader is listening: ${settings.config.imageUploader.innerHostName}:${settings.config.imageUploader.port}`);
});
