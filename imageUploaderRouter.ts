"use strict";

import * as types from "./types";
import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

export function route() {
    let app: libs.Application = libs.express();

    app.settings.env = settings.currentEnvironment;

    app.use(libs.compression());

    app.use(libs.cookieParser());

    app.use(libs.bodyParser.json());
    app.use(libs.bodyParser.urlencoded({ extended: true }));

    app.use(libs.cors(settings.cors.get(settings.currentEnvironment)));

    services.cache.connect();

    let documentOfUploadPersistentImages: types.Document = {
        url: "/api/persistent",
        method: "post",
        documentUrl: "/api/image/upload images to persistent directory.html",
    };

    let documentOfUploadTemperaryImages: types.Document = {
        url: "/api/temperary",
        method: "post",
        documentUrl: "/api/image/upload images to temperary directory.html",
    };

    let documentOfMoveImage: types.Document = {
        url: "/api/persistence",
        method: "post",
        documentUrl: "/api/image/move image from temperary directory to persistent directory.html",
    };

    let storage = libs.multer.diskStorage({
        destination: function(request: libs.Request, file, next) {
            if (request.path === documentOfUploadPersistentImages.url
                || request.path === "/api/persistent/images") {
                if (settings.currentEnvironment === types.environment.test) {
                    next(null, "test_images/");
                } else {
                    next(null, "images/");
                }
            } else if (request.path === documentOfUploadTemperaryImages.url
                || request.path === "/api/temperary/images") {
                if (settings.currentEnvironment === types.environment.test) {
                    next(null, "test_images/tmp/");
                } else {
                    next(null, "images/tmp/");
                }
            } else {
                next(services.error.fromMessage("can not upload files at this url:" + request.path, types.StatusCode.forbidden));
            }
        },
        filename: function(request: libs.Request, file, next) {
            if (request.path === documentOfUploadPersistentImages.url
                || request.path === "/api/persistent/images") {
                next(null, file.fieldname);
            } else if (request.path === documentOfUploadTemperaryImages.url
                || request.path === "/api/temperary/images") {
                next(null, libs.generateUuid() + libs.path.extname(file.originalname));
            } else {
                next(services.error.fromMessage("can not upload files at this url:" + request.path, types.StatusCode.forbidden));
            }
        },
    });

    let upload = libs.multer({ storage: storage }).any();

    let uploadAsync = (request: libs.Request, response: libs.Response) => {
        return new Promise((resolve, reject) => {
            upload(request, response, error => {
                if (error) {
                    reject(services.error.fromError(error, types.StatusCode.invalidRequest));
                } else {
                    resolve();
                }
            });
        });
    };

    services.rateLimit.route(app);

    services.version.route(app);

    let uploadIPWhiteList = settings.uploadIPWhiteList.get(settings.currentEnvironment);

    async function uploadPersistentImages(request: libs.Request, response: libs.Response) {
        try {
            if (!libs._.find(uploadIPWhiteList, i => i === request.ip)) {
                throw services.error.fromInvalidIP(request.ip);
            }

            await uploadAsync(request, response);

            services.response.sendSuccess(response, types.StatusCode.createdOrModified, {
                names: libs._.map(request.files, (f: any) => f.filename)
            });
        } catch (error) {
            services.response.sendError(response, error);
        }
    }

    async function uploadTemperaryImages(request: libs.Request, response: libs.Response) {
        try {
            let userId = request.userId;
            if (!userId) {
                throw services.error.fromUnauthorized();
            }

            await uploadAsync(request, response);

            services.response.sendSuccess(response, types.StatusCode.createdOrModified, {
                names: libs._.map(request.files, (f: any) => f.filename)
            });
        } catch (error) {
            services.response.sendError(response, error);
        }
    }

    async function moveImage(request: libs.Request, response: libs.Response) {
        try {
            let name = libs.validator.trim(request.body.name);
            let newName = libs.validator.trim(request.body.newName);

            if (!name) {
                throw services.error.fromParameterIsMissedMessage("name");
            }

            if (!newName) {
                throw services.error.fromParameterIsMissedMessage("newName");
            }

            if (!libs._.find(uploadIPWhiteList, i => i === request.ip)) {
                throw services.error.fromInvalidIP(request.ip);
            }

            let path = settings.currentEnvironment === types.environment.test ? "test_images" : "images";

            await libs.renameAsync(libs.path.join(__dirname, `${path}/tmp/${name}`), libs.path.join(__dirname, `${path}/${newName}`));

            services.response.sendSuccess(response, types.StatusCode.createdOrModified);
        } catch (error) {
            services.response.sendError(response, error);
        }
    }

    services.router.bind(documentOfUploadPersistentImages, uploadPersistentImages, app);
    services.router.bind(documentOfUploadTemperaryImages, uploadTemperaryImages, app);
    services.router.bind(documentOfMoveImage, moveImage, app);

    let imageUploader = settings.imageUploader.get(settings.currentEnvironment);
    app.listen(imageUploader.port, imageUploader.host, () => {
        console.log(libs.colors.green(`Image uploader is listening: ${settings.getImageUploader()} and in ${settings.currentEnvironment}`));
    });
}
