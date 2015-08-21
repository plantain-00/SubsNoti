import libs = require("./libs");
import settings = require("./settings");

import enums = require("./enums/enums");
import interfaces = require("./interfaces/interfaces");
import models = require("./models/models");

import services = require("./services/services");

import controllers = require("./controllers/controllers");

import docs = require("./docs");

export function apply(app:libs.Application) {

    app.post(controllers.token.generateDocument.url, controllers.token.generate);
    app.get(controllers.token.acceptDocument.url, controllers.token.accept);
    app.get(controllers.token.validateDocument.url, controllers.token.validate);

    libs._.each(docs.notGetDocuments, (api:interfaces.ApiDocument)=> {
        app.get(api.url, (request:libs.Request, response:libs.Response)=> {
            services.response.sendWrongHttpMethod(response, api.documentUrl);
        });
    });

    const documentsHome = {
        name: "API document",
        apis: []
    };

    libs._.each(docs.allDocuments, (api:interfaces.ApiDocument)=> {
        api.documentUrl = "/doc/api/" + libs.md5(api.name);
        documentsHome.apis.push("<a href='" + api.documentUrl + "'>" + api.name + "</a> -  <a href='" + api.url + "'>" + api.url + "</a> - " + api.method);
        api.url = "<a href='" + api.url + "'>" + api.url + "</a>";

        app.get(api.documentUrl, (request:libs.Request, response:libs.Response) => {
            response.status(200).type('html').send("<style>*{font-family: 'Courier New'}</style><title>" + api.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(api, null, 4) + "<pre>");
        });
    });

    app.get("/api", (request:libs.Request, response:libs.Response)=> {
        response.status(200).type('html').send("<style>*{font-family: 'Courier New'}a:link{color:black;text-decoration: none}a:visited {color:black;text-decoration: none}a:hover {color:black;text-decoration: none}a:active {color:black;text-decoration: none}</style><title>" + documentsHome.name + "</title><pre style='font-size:16px;'>" + JSON.stringify(documentsHome, null, 4) + "<pre>");
    });
}