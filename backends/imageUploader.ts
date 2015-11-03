'use strict';

import * as libs from "./libs";
import * as settings from "./settings";

import * as enums from "../common/enums";

import * as services from "./services";

let app: libs.Application = libs.express();

app.settings.env = settings.config.environment;

app.use(libs.compression());

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
      services.authenticationCredential.authenticate(request).then(userId=> {
        next(null, 'publish/images/tmp/');
      }, error=> {
        next(error);
      });
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
  if (request.files.length === 0) {
    services.response.sendError(response, services.error.fromMessage('no file.', enums.StatusCode.invalidRequest), documentOfUploadPersistentImages.documentUrl);
    return;
  }

  if (!libs._.find(settings.config.ipWhiteList, i=> i === request.ip)) {
    services.response.sendError(response, services.error.fromMessage('your ip ' + request.ip + ' in not in the white list.', enums.StatusCode.forbidden), documentOfUploadPersistentImages.documentUrl);
    return;
  }

  services.response.sendSuccess(response, enums.StatusCode.createdOrModified, {
    urls: libs._.map(request.files, (f: any) => `${settings.config.imageServer.outerHostName}:${settings.config.imageServer.port}/${f.filename}`)
  });
});

app.post(documentOfUploadTemperaryImages.url, upload.any(), async(request: libs.Request, response: libs.Response) => {
  try {
    if (request.files.length === 0) {
      services.response.sendError(response, services.error.fromMessage('no file.', enums.StatusCode.invalidRequest), documentOfUploadPersistentImages.documentUrl);
      return;
    }

    let userId = await services.authenticationCredential.authenticate(request);

    services.response.sendSuccess(response, enums.StatusCode.createdOrModified, {
      urls: libs._.map(request.files, (f: any) => `${settings.config.imageServer.outerHostName}:${settings.config.imageServer.port}/tmp/${f.filename}`)
    })
  }
  catch (error) {
    services.response.sendError(response, error, documentOfUploadTemperaryImages.documentUrl);
  }
});

app.listen(settings.config.imageUploader.port, settings.config.imageUploader.innerHostName, () => {
  console.log(`Image uploader is listening: ${settings.config.imageUploader.innerHostName}:${settings.config.imageUploader.port}`);
});