import * as types from "./share/types";
import * as libs from "./libs";
import * as settings from "./settings";
import * as services from "./services";

const app = libs.express();

app.use(libs.compression());

app.use(libs.cookieParser());

app.use(libs.bodyParser.json());
app.use(libs.bodyParser.urlencoded({ extended: true }));

app.use(libs.cors(settings.cors));

services.redis.connect();

services.mongo.connect();

const documentOfUploadPersistentImages: types.Document = {
    url: "/api/persistent",
    method: types.httpMethod.post,
    documentUrl: "/api/image/upload images to persistent directory.html",
};

const documentOfUploadTemperaryImages: types.Document = {
    url: "/api/temperary",
    method: types.httpMethod.post,
    documentUrl: "/api/image/upload images to temperary directory.html",
};

const documentOfMoveImage: types.Document = {
    url: "/api/persistence",
    method: types.httpMethod.post,
    documentUrl: "/api/image/move image from temperary directory to persistent directory.html",
};

const storage = libs.multer.diskStorage({
    destination: function (request: libs.Request, file, next) {
        const mimeType: string = file.mimetype;
        if (!mimeType.startsWith("image/")) {
            next(new Error("not image"));
            return;
        }
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
            next("can not upload files at this url:" + request.path);
        }
    },
    filename: function (request: libs.Request, file, next) {
        const mimeType: string = file.mimetype;
        if (!mimeType.startsWith("image/")) {
            next(new Error("not image"));
            return;
        }
        if (request.path === documentOfUploadPersistentImages.url
            || request.path === "/api/persistent/images") {
            next(null, file.fieldname);
        } else if (request.path === documentOfUploadTemperaryImages.url
            || request.path === "/api/temperary/images") {
            next(null, libs.generateUuid() + "." + libs.mime.extension(file.mimetype));
        } else {
            next("can not upload files at this url:" + request.path);
        }
    },
});

const upload = libs.multer({ storage: storage }).any();

const uploadAsync = (request: libs.Request, response: libs.Response) => {
    return new Promise((resolve, reject) => {
        if (!request.files) {
            throw services.error.noFile;
        }

        upload(request, response, error => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
};

services.version.route(app);
services.rateLimit.route(app);

const uploadIPWhiteList = settings.uploadIPWhiteList;

async function uploadPersistentImages(request: libs.Request, response: libs.Response) {
    if (!uploadIPWhiteList.find(i => i === request.ip)) {
        throw libs.util.format(services.error.invalidIP, request.ip);
    }

    await uploadAsync(request, response);

    services.response.sendSuccess(response, {
        names: request.files.map(f => f.filename),
    });
}

async function uploadTemperaryImages(request: libs.Request, response: libs.Response) {
    if (!request.userId) {
        throw services.error.unauthorized;
    }

    await uploadAsync(request, response);

    services.response.sendSuccess(response, {
        names: request.files.map(f => f.filename),
    });
}

async function moveImage(request: libs.Request, response: libs.Response) {
    const name = typeof request.body.name === "string" ? libs.validator.trim(request.body.name) : "";
    const newName = typeof request.body.newName === "string" ? libs.validator.trim(request.body.newName) : "";

    if (!name) {
        throw libs.util.format(services.error.parameterIsMissed, "name");
    }

    if (!newName) {
        throw libs.util.format(services.error.parameterIsMissed, "newName");
    }

    if (!uploadIPWhiteList.find(i => i === request.ip)) {
        throw libs.util.format(services.error.invalidIP, request.ip);
    }

    const path = settings.currentEnvironment === types.environment.test ? "test_images" : "images";

    await libs.renameAsync(libs.path.join(__dirname, `${path}/tmp/${name}`), libs.path.join(__dirname, `${path}/${newName}`));

    services.response.sendSuccess(response);
}

services.router.bind(documentOfUploadPersistentImages, uploadPersistentImages, app);
services.router.bind(documentOfUploadTemperaryImages, uploadTemperaryImages, app);
services.router.bind(documentOfMoveImage, moveImage, app);

const argv = libs.minimist(process.argv.slice(2));
const port = argv.p || 9999;
const host = argv.h || "localhost";

app.listen(port, host, () => {
    services.logger.logInfo(`Image uploader is listening: ${host}:${port} and in ${settings.currentEnvironment}`);
});
