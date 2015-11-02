'use strict';

import * as libs from "./libs";
import * as settings from "./settings";

import * as enums from "../common/enums";

import * as services from "./services";

let app: libs.Application = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

app.use(libs.express.static(libs.path.join(__dirname, '../images')));

let documentOfUploadPersistentImages = {
  url: "/api/persistent/images",
  method: "post",
  documentUrl: "Upload images to persistent directory.html"
};

let documentOfUploadTemperaryImages = {
  url: "/api/temperary/images",
  method: "post",
  documentUrl: "Upload images to temperary directory.html"
};

let storage = libs.multer.diskStorage({
  destination: function(request: libs.Request, file, next) {
    if (request.path === documentOfUploadPersistentImages.url) {
      if (!libs._.find(settings.config.ipWhiteList, i=> i === request.ip)) {
        next(services.error.fromMessage('your ip ' + request.ip + ' in not in the white list.', enums.StatusCode.forbidden));
        return;
      }
      next(null, 'publish/images/');
    }
    else if (request.path === documentOfUploadTemperaryImages.url) {
      next(null, 'publish/images/tmp/');
    }
    else {
      next(services.error.fromMessage('can not upload files at this url:' + request.path, enums.StatusCode.forbidden));
    }
  },
  filename: function(request: libs.Request, file, next) {
    if (request.path === documentOfUploadPersistentImages.url) {
      if (!libs._.find(settings.config.ipWhiteList, i=> i === request.ip)) {
        next(services.error.fromMessage('your ip ' + request.ip + ' in not in the white list.', enums.StatusCode.forbidden));
        return;
      }
      next(null, file.fieldname);
    }
    else if (request.path === documentOfUploadTemperaryImages.url) {
      next(null, libs.generateUuid() + libs.path.extname(file.originalname));
    }
    else {
      next(services.error.fromMessage('can not upload files at this url:' + request.path, enums.StatusCode.forbidden));
    }
  }
})

let upload = libs.multer({ storage: storage })

app.post(documentOfUploadPersistentImages.url, upload.any(), (request: libs.Request, response: libs.Response) => {
  if (!libs._.find(settings.config.ipWhiteList, i=> i === request.ip)) {
    services.response.sendError(response, services.error.fromMessage('your ip ' + request.ip + ' in not in the white list.', enums.StatusCode.forbidden), documentOfUploadPersistentImages.documentUrl);
    return;
  }

  services.response.sendSuccess(response, enums.StatusCode.createdOrModified, {
    urls: libs._.map(request['files'], (f: any) => '/' + f.filename)
  });
});

app.post(documentOfUploadTemperaryImages.url, upload.any(), (request: libs.Request, response: libs.Response) => {
  services.response.sendSuccess(response, enums.StatusCode.createdOrModified, {
    urls: libs._.map(request['files'], (f: any) => '/tmp/' + f.filename)
  })
});

app.listen(settings.config.imageServer.port, settings.config.imageServer.innerHostName, () => {
  console.log(`Image server has started at port: ${settings.config.imageServer.port}`);
});
