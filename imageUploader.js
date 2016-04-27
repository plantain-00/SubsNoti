"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const types = require("./share/types");
const libs = require("./libs");
const settings = require("./settings");
const services = require("./services");
const app = libs.express();
app.use(libs.compression());
app.use(libs.cookieParser());
app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));
app.use(libs.cors(settings.cors));
services.redis.connect();
services.mongo.connect();
const documentOfUploadPersistentImages = {
    url: "/api/persistent",
    method: types.httpMethod.post,
    documentUrl: "/api/image/upload images to persistent directory.html",
};
const documentOfUploadTemperaryImages = {
    url: "/api/temperary",
    method: types.httpMethod.post,
    documentUrl: "/api/image/upload images to temperary directory.html",
};
const documentOfMoveImage = {
    url: "/api/persistence",
    method: types.httpMethod.post,
    documentUrl: "/api/image/move image from temperary directory to persistent directory.html",
};
const storage = libs.multer.diskStorage({
    destination: function (request, file, next) {
        const mimeType = file.mimetype;
        if (!mimeType.startsWith("image/")) {
            next(new Error("not image"));
        }
        if (request.path === documentOfUploadPersistentImages.url
            || request.path === "/api/persistent/images") {
            if (settings.currentEnvironment === types.environment.test) {
                next(null, "test_images/");
            }
            else {
                next(null, "images/");
            }
        }
        else if (request.path === documentOfUploadTemperaryImages.url
            || request.path === "/api/temperary/images") {
            if (settings.currentEnvironment === types.environment.test) {
                next(null, "test_images/tmp/");
            }
            else {
                next(null, "images/tmp/");
            }
        }
        else {
            next(services.error.fromMessage("can not upload files at this url:" + request.path, 403 /* forbidden */));
        }
    },
    filename: function (request, file, next) {
        const mimeType = file.mimetype;
        if (!mimeType.startsWith("image/")) {
            next(new Error("not image"));
        }
        if (request.path === documentOfUploadPersistentImages.url
            || request.path === "/api/persistent/images") {
            next(null, file.fieldname);
        }
        else if (request.path === documentOfUploadTemperaryImages.url
            || request.path === "/api/temperary/images") {
            next(null, libs.generateUuid() + "." + libs.mime.extension(file.mimetype));
        }
        else {
            next(services.error.fromMessage("can not upload files at this url:" + request.path, 403 /* forbidden */));
        }
    },
});
const upload = libs.multer({ storage: storage }).any();
const uploadAsync = (request, response) => {
    return new Promise((resolve, reject) => {
        upload(request, response, error => {
            if (error) {
                reject(services.error.fromError(error, 400 /* invalidRequest */));
            }
            else {
                resolve();
            }
        });
    });
};
services.version.route(app);
services.rateLimit.route(app);
const uploadIPWhiteList = settings.uploadIPWhiteList;
function uploadPersistentImages(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!uploadIPWhiteList.find(i => i === request.ip)) {
            throw services.error.fromInvalidIP(request.ip);
        }
        yield uploadAsync(request, response);
        services.response.sendSuccess(response, 201 /* createdOrModified */, {
            names: request.files.map(f => f.filename),
        });
    });
}
function uploadTemperaryImages(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!request.userId) {
            throw services.error.fromUnauthorized();
        }
        yield uploadAsync(request, response);
        services.response.sendSuccess(response, 201 /* createdOrModified */, {
            names: request.files.map(f => f.filename),
        });
    });
}
function moveImage(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = typeof request.body.name === "string" ? libs.validator.trim(request.body.name) : "";
        const newName = typeof request.body.newName === "string" ? libs.validator.trim(request.body.newName) : "";
        if (!name) {
            throw services.error.fromParameterIsMissedMessage("name");
        }
        if (!newName) {
            throw services.error.fromParameterIsMissedMessage("newName");
        }
        if (!uploadIPWhiteList.find(i => i === request.ip)) {
            throw services.error.fromInvalidIP(request.ip);
        }
        const path = settings.currentEnvironment === types.environment.test ? "test_images" : "images";
        yield libs.renameAsync(libs.path.join(__dirname, `${path}/tmp/${name}`), libs.path.join(__dirname, `${path}/${newName}`));
        services.response.sendSuccess(response, 201 /* createdOrModified */);
    });
}
services.router.bind(documentOfUploadPersistentImages, uploadPersistentImages, app);
services.router.bind(documentOfUploadTemperaryImages, uploadTemperaryImages, app);
services.router.bind(documentOfMoveImage, moveImage, app);
app.listen(settings.imageUploaderPort, "localhost", () => {
    services.logger.logInfo(`Image uploader is listening: ${settings.imageUploaderPort} and in ${settings.currentEnvironment}`);
});
